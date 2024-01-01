import mongoose, { mongo } from "mongoose"
import { IResponse } from "../../constants"
import {
  AlphaNumeric,
  deg2rad,
  genRandomNumber,
  queryConstructor,
} from "../../utils"
import OrderRepository from "./order.repository"
import { orderMessages } from "./order.messages"
import VendorRepository from "../partner/vendor/vendor.repository"
import { partnerMessages } from "../partner/partner.messages"
import UserRepository from "../user/user.repository"
import ItemRepository from "../item/item.repository"
import SubscriptionRepository from "../subscription/subscription.repository"
import { DayPayload, IOrder } from "./order.interface"
import PartnerRepository from "../partner/partner.repository"

export default class OrderService {
  static async evaluateOrderService(
    orderPayload: {
      vendorId: string
      lng: any
      lat: any
      item: [{ _id: any; quantity: Number; price: Number }]
      note: string
      pickUp: Boolean
      deliveryAddress: string
    },
    locals: any,
  ): Promise<IResponse> {
    const { vendorId, lng, lat, item, note, deliveryAddress, pickUp } =
      orderPayload

    const vendor = await VendorRepository.fetchVendor(
      {
        _id: new mongoose.Types.ObjectId(vendorId),
      },
      {},
    )
    if (!vendor) return { success: false, msg: partnerMessages.VENDOR_ERROR }

    let vendorLng: any
    let vendorLat: any

    // Check if vendor.locationCoord is defined before accessing its properties
    if (vendor.locationCoord && vendor.locationCoord.coordinates) {
      vendorLat = vendor.locationCoord.coordinates[0]
      vendorLng = vendor.locationCoord.coordinates[1]
    } else {
      // Handle the case where locationCoord or coordinates is undefined
      return {
        success: false,
        msg: "Location coordinates not available for the vendor.",
      }
    }

    // Radius of the Earth in kilometers
    const R = 6371.0
    // Convert latitude and longitude from degrees to radians
    const lat1Rad: any = deg2rad(vendorLat)
    const lon1Rad: any = deg2rad(vendorLng)
    const lat2Rad: any = deg2rad(lat)
    const lon2Rad: any = deg2rad(lng)

    // Haversine formula
    const dLat = lat2Rad - lat1Rad
    const dLon = lon2Rad - lon1Rad
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    let kilometers: any = distance.toFixed(2)

    let ridersFee

    const customer = await UserRepository.fetchUser(
      { _id: new mongoose.Types.ObjectId(locals._id) },
      {},
    )

    if (!customer) return { success: false, msg: `unable to identify customer` }

    const allItems = await ItemRepository.findAllItems({})

    const result = item.map((payloadItem) => {
      // Check if the payload item's _id exists in the database
      const matchingItem = allItems.find(
        (item) => item._id.toString() === payloadItem._id,
      )

      return matchingItem
    })

    if (!result) return { success: false, msg: orderMessages.NOT_AVAILABLE }

    // Calculate the total price based on the item array
    const netAmount = item.reduce((total, currentItem: any) => {
      return total + currentItem.price * currentItem.quantity
    }, 0)

    let orderItems: { _id: any; quantity: Number; price: Number }[] = []

    item.forEach((payloadItem) => {
      orderItems.push({
        _id: payloadItem._id,
        quantity: payloadItem.quantity,
        price: payloadItem.price,
      })
    })

    let serviceCharge
    let parsePickUpNumber
    let parseOrderCode
    let roundTotalPrice: any
    let pickUpNumber

    if (deliveryAddress) {
      ridersFee = kilometers * 2
      const parseAmount: any = Number(netAmount)
      const deliveryFee: Number = 2
      const marketPlace: Number = 3

      let totalPrice: any = parseAmount + deliveryFee + marketPlace + ridersFee
      roundTotalPrice = Math.ceil(totalPrice)
      serviceCharge = (10 * roundTotalPrice) / 100

      pickUpNumber = genRandomNumber()
      parsePickUpNumber = Number(pickUpNumber)
      let orderCode = genRandomNumber()
      parseOrderCode = Number(orderCode)
    }

    if (pickUp) {
      ridersFee = 0
      const parseAmount: any = Number(netAmount)
      const marketPlace: Number = 3

      let totalPrice: any = parseAmount + marketPlace
      roundTotalPrice = Math.ceil(totalPrice)
      serviceCharge = (10 * roundTotalPrice) / 100

      pickUpNumber = genRandomNumber()
      parsePickUpNumber = Number(pickUpNumber)
      let orderCode = genRandomNumber()
      parseOrderCode = Number(orderCode)
    }

    let orderId = `#${AlphaNumeric(3, "number")}`

    //confirm wallet
    const confirmWallet = await UserRepository.fetchUser(
      {
        _id: new mongoose.Types.ObjectId(locals._id),
      },
      {},
    )

    const walletBalance: any = confirmWallet?.wallet

    if (roundTotalPrice > walletBalance)
      return {
        success: false,
        msg: `insufficient funds, kindly fund your wallet`,
      }

    const currentOrder = await OrderRepository.createOrder({
      pickUpCode: parsePickUpNumber,
      orderId,
      pickUp,
      deliveryAddress,
      orderCode: parseOrderCode,
      itemId: item,
      orderedBy: new mongoose.Types.ObjectId(locals._id),
      vendorId: new mongoose.Types.ObjectId(vendor._id),
      locationCoord: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      userEmail: locals.email,
      ridersFee,
      userName: locals.fullName,
      note,
      schedule: false,
      serviceCharge,
      orderDate: new Date(),
      totalAmount: roundTotalPrice,
      netAmount,
    })

    if (!currentOrder)
      return { success: false, msg: orderMessages.ORDER_FAILURE }

    await UserRepository.updateUsersProfile(
      { _id: new mongoose.Types.ObjectId(locals._id) },
      { $inc: { wallet: -roundTotalPrice } },
    )

    return {
      success: true,
      msg: `Order successful. Wallet debited of ${roundTotalPrice}. Wallet is refunded if seller rejects order`,
      data: currentOrder,
    }
  }

  static async evaluateScheduleOrderService(
    orderPayload: {
      startDate: Date
      endDate: Date
      lat: any
      lng: any
      note: string
      pickUp: Boolean
      deliveryAddress: string
      vendorId: string
      monday: DayPayload
      tuesday: DayPayload
      wednesday: DayPayload
      thursday: DayPayload
      friday: DayPayload
      saturday: DayPayload
      sunday: DayPayload
    },
    locals: any,
  ): Promise<IResponse> {
    const {
      startDate,
      endDate,
      vendorId,
      lng,
      lat,
      note,
      pickUp,
      deliveryAddress,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    } = orderPayload

    const confirmSchedule = await SubscriptionRepository.fetchSubscription(
      { startDate, endDate },
      {},
    )

    if (confirmSchedule)
      return {
        success: false,
        msg: `similar start date and end date already exist`,
      }

    const schedule = await SubscriptionRepository.createSubscription({
      startDate,
      endDate,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      userId: new mongoose.Types.ObjectId(locals),
    })

    if (!schedule) return { success: false, msg: `unable to create schedule` }

    const vendor = await VendorRepository.fetchVendor(
      {
        _id: new mongoose.Types.ObjectId(vendorId),
      },
      {},
    )
    if (!vendor) return { success: false, msg: partnerMessages.VENDOR_ERROR }

    let vendorLng: any
    let vendorLat: any

    // Check if vendor.locationCoord is defined before accessing its properties
    if (vendor.locationCoord && vendor.locationCoord.coordinates) {
      vendorLat = vendor.locationCoord.coordinates[0]
      vendorLng = vendor.locationCoord.coordinates[1]
    } else {
      // Handle the case where locationCoord or coordinates is undefined
      return {
        success: false,
        msg: "Location coordinates not available for the vendor.",
      }
    }

    // Radius of the Earth in kilometers
    const R = 6371.0
    // Convert latitude and longitude from degrees to radians
    const lat1Rad: any = deg2rad(vendorLat)
    const lon1Rad: any = deg2rad(vendorLng)
    const lat2Rad: any = deg2rad(lat)
    const lon2Rad: any = deg2rad(lng)

    // Haversine formula
    const dLat = lat2Rad - lat1Rad
    const dLon = lon2Rad - lon1Rad
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    let kilometers: any = distance.toFixed(2)

    let ridersFee

    const customer = await UserRepository.fetchUser(
      { _id: new mongoose.Types.ObjectId(locals) },
      {},
    )

    if (!customer) return { success: false, msg: `unable to identify customer` }

    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]
    const allItems: any[] = []

    for (const day of days) {
      // Use type assertion directly on orderPayload[day]
      const dayPayload: DayPayload | undefined =
        orderPayload[day as keyof typeof orderPayload]

      // Check if the dayPayload and its breakfast, lunch, dinner properties exist
      if (
        dayPayload &&
        dayPayload.breakfast &&
        dayPayload.lunch &&
        dayPayload.dinner
      ) {
        // Concatenate items for each meal
        const allMealsItems = dayPayload.breakfast.item.concat(
          dayPayload.lunch.item,
          dayPayload.dinner.item,
        )
        allItems.push(...allMealsItems)
      }
    }

    // Calculate the total price based on the item array
    const netAmount = allItems.reduce((total, currentItem: any) => {
      return total + currentItem.price * currentItem.quantity
    }, 0)

    /// Directly specify the type when declaring orderItems
    let orderItems: any = []

    // Populate orderItems
    allItems.forEach((payloadItem) => {
      orderItems.push({
        _id: payloadItem._id,
        quantity: payloadItem.quantity,
        price: payloadItem.price,
      })
    })

    let serviceCharge
    let parsePickUpNumber
    let parseOrderCode
    let roundTotalPrice: any
    let pickUpNumber

    if (deliveryAddress) {
      ridersFee = kilometers * 2
      const parseAmount: any = Number(netAmount)
      const deliveryFee: number = 2
      const marketPlace: number = 3

      let totalPrice: any = parseAmount + deliveryFee + marketPlace + ridersFee
      roundTotalPrice = Math.ceil(totalPrice)
      serviceCharge = (10 * roundTotalPrice) / 100

      pickUpNumber = genRandomNumber()
      parsePickUpNumber = Number(pickUpNumber)
      let orderCode = genRandomNumber()
      parseOrderCode = Number(orderCode)
    }

    if (pickUp) {
      ridersFee = 0
      const parseAmount: any = Number(netAmount)
      const marketPlace: number = 3

      let totalPrice: any = parseAmount + marketPlace
      roundTotalPrice = Math.ceil(totalPrice)
      serviceCharge = (10 * roundTotalPrice) / 100

      pickUpNumber = genRandomNumber()
      parsePickUpNumber = Number(pickUpNumber)
      let orderCode = genRandomNumber()
      parseOrderCode = Number(orderCode)
    }

    let orderId = `#${AlphaNumeric(3, "number")}`

    // Confirm wallet balance
    const confirmWallet = await UserRepository.fetchUser(
      {
        _id: new mongoose.Types.ObjectId(locals._id),
      },
      {},
    )

    const walletBalance: any = confirmWallet?.wallet

    if (roundTotalPrice > walletBalance) {
      return {
        success: false,
        msg: `Insufficient funds, kindly fund your wallet`,
      }
    }

    const currentOrder = await OrderRepository.createOrder({
      pickUpCode: parsePickUpNumber,
      orderId,
      pickUp,
      deliveryAddress,
      orderCode: parseOrderCode,
      itemId: orderItems,
      orderedBy: new mongoose.Types.ObjectId(locals._id),
      vendorId: new mongoose.Types.ObjectId(vendor._id),
      locationCoord: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      userEmail: locals.email,
      ridersFee,
      userName: locals.fullName,
      note,
      serviceCharge,
      orderDate: new Date(),
      totalAmount: roundTotalPrice,
      schedule: true,
      netAmount,
      scheduleId: new mongoose.Types.ObjectId(schedule._id),
    })

    if (!currentOrder) {
      return { success: false, msg: orderMessages.ORDER_FAILURE }
    }

    return {
      success: true,
      msg: orderMessages.ORDER_SUCCESS,
      data: currentOrder,
    }
  }

  static async fetchOrderService(subscriptionPayload: Partial<IOrder>) {
    const { error, params, limit, skip, sort } = queryConstructor(
      subscriptionPayload,
      "createdAt",
      "Order",
    )

    if (error) return { success: false, msg: error }

    const order = await OrderRepository.fetchOrderByParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (order.length < 1)
      return { success: false, msg: orderMessages.NOT_FOUND, data: [] }

    return {
      success: true,
      msg: orderMessages.FETCH_SUCCESS,
      data: order,
    }
  }

  static async updateOrderService(orderId: any, data: Partial<IOrder>) {
    const { orderStatus } = data
    const findOrder = await OrderRepository.fetchOrder(
      { _id: new mongoose.Types.ObjectId(orderId) },
      {},
    )
    if (!findOrder)
      return { success: false, msg: orderMessages.NOT_FOUND, data: [] }

    if (orderStatus === "accepted") {
      const user = await UserRepository.fetchUser(
        { _id: new mongoose.Types.ObjectId(findOrder.orderedBy) },
        {},
      )
      if (!user) return { success: false, msg: `buyer not found` }

      // Ensure findOrder.totalAmount is defined or provide a default value of 0
      const totalAmount: any = findOrder.totalAmount
      await VendorRepository.updateVendorDetails(
        { vendorId: findOrder.vendorId },
        { $inc: { wallet: totalAmount } },
      )
    }
    
    if (orderStatus === "cancelled") {
      const user = await UserRepository.fetchUser(
        { _id: new mongoose.Types.ObjectId(findOrder.orderedBy) },
        {},
      )
      if (!user) return { success: false, msg: `buyer not found` }

      const totalAmount: any = findOrder.totalAmount
      await UserRepository.updateUsersProfile(
        { _id: new mongoose.Types.ObjectId(user._id) },
        { $inc: { wallet: totalAmount } },
      )
    }

    await OrderRepository.updateOrderDetails(
      { _id: new mongoose.Types.ObjectId(findOrder._id) },
      { ...data },
    )

    return {
      success: true,
      msg: orderMessages.UPDATE_SUCCESS,
    }
  }
}
