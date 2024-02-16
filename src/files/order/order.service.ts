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
import { sendMailNotification } from "../../utils/email"
import RiderRepository from "../rider/rider.repository"
import TransactionRepository from "../transactions/transaction.repository"

export default class OrderService {
  static async evaluateOrderService(
    orderPayload: {
      vendorId: string
      isEvent?: Boolean
      isBulk?: Boolean
      daysOfEvent?: Number
      lng?: any
      lat?: any
      item: [
        {
          _id: any
          quantity: Number
          price: Number
          day?: Date
          period?: "breakfast" | "lunch" | "dinner"
          preferredTime?: string
        },
      ]
      note?: string
      pickUp?: Boolean
      deliveryAddress: string
      startDate?: Date
      endDate?: Date
      startTime?: string
      endTime?: string
      eventDescription?: string
      eventLocation?: string
      schedule?: boolean
    },
    locals: any,
  ): Promise<IResponse> {
    const {
      vendorId,
      lng,
      lat,
      item,
      note,
      deliveryAddress,
      pickUp,
      isEvent,
      isBulk,
      startDate,
      endDate,
      startTime,
      endTime,
      eventDescription,
      daysOfEvent,
      eventLocation,
      schedule,
    } = orderPayload
    let kilometers: any
    const vendor = await VendorRepository.fetchVendor(
      {
        _id: new mongoose.Types.ObjectId(vendorId),
      },
      {},
    )
    if (!vendor) return { success: false, msg: partnerMessages.VENDOR_ERROR }

    let vendorLng: any
    let vendorLat: any
    if (deliveryAddress) {
      // Check if vendor.locationCoord is defined before accessing its properties
      if (vendor?.locationCoord && vendor?.locationCoord?.coordinates) {
        vendorLng = vendor?.locationCoord?.coordinates[0]
        vendorLat = vendor?.locationCoord?.coordinates[1]
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

      kilometers = distance.toFixed(2)
    }

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
    if (isEvent) {
      ridersFee = 0
    }

    const totalSum: Number = serviceCharge + roundTotalPrice

    let location: any = {
      type: "Point",
      coordinates: [parseFloat("0"), parseFloat("0")],
    }

    if (lat && lng) {
      location = {
        type: "Point",
        coordinates: [parseFloat(vendorLng), parseFloat(vendorLat)],
      }
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
      locationCoord: location,
      userEmail: locals.email,
      ridersFee,
      isEvent,
      userName: locals.fullName,
      note,
      serviceCharge,
      orderDate: new Date(),
      totalAmount: totalSum,
      netAmount,
      startDate,
      endDate,
      startTime,
      endTime,
      eventDescription,
      daysOfEvent,
      eventLocation,
      isBulk,
      schedule,
    })

    if (!currentOrder)
      return { success: false, msg: orderMessages.ORDER_FAILURE }

    return {
      success: true,
      msg: `Order successful. Vendor will review your order`,
      data: currentOrder,
    }
  }

  static async evaluateScheduleOrderService(
    orderPayload: {
      startDate: Date
      endDate: Date
      lat?: any
      lng?: any
      note: string
      pickUp: Boolean
      deliveryAddress: string
      vendorId: string
      monday?: DayPayload
      tuesday?: DayPayload
      wednesday?: DayPayload
      thursday?: DayPayload
      friday?: DayPayload
      saturday?: DayPayload
      sunday?: DayPayload
    },
    locals: any,
  ): Promise<IResponse> {
    let kilometers: any
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

    if (deliveryAddress) {
      // Check if vendor.locationCoord is defined before accessing its properties
      if (vendor?.locationCoord && vendor?.locationCoord?.coordinates) {
        vendorLng = vendor?.locationCoord?.coordinates[0]
        vendorLat = vendor?.locationCoord?.coordinates[1]
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

      kilometers = distance.toFixed(2)
    }

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
    let allItems: any[] = []
    let allMealsItems

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
        allMealsItems = dayPayload.breakfast.item.concat(
          dayPayload.lunch.item,
          dayPayload.dinner.item,
        )
        allItems.push(...allMealsItems)
      }
    }

    let serviceCharge
    let parsePickUpNumber
    let parseOrderCode
    let roundTotalPrice: any
    let pickUpNumber

    // Calculate the total price based on the item array
    let netAmount = allItems.reduce((total, currentItem: any) => {
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
    const totalSum: Number = serviceCharge + roundTotalPrice

    let location: any = {
      type: "Point",
      coordinates: [parseFloat("0"), parseFloat("0")],
    }

    if (lat && lng) {
      location = {
        type: "Point",
        coordinates: [parseFloat(vendorLng), parseFloat(vendorLat)],
      }
    }

    const currentOrder = await OrderRepository.createOrder({
      pickUpCode: parsePickUpNumber,
      orderId,
      pickUp,
      deliveryAddress,
      orderCode: parseOrderCode,
      itemId: orderItems,
      orderedBy: new mongoose.Types.ObjectId(locals),
      vendorId: new mongoose.Types.ObjectId(vendor._id),
      locationCoord: location,
      userEmail: locals.email,
      ridersFee,
      userName: locals.fullName,
      isWallet: true,
      note,
      serviceCharge,
      orderDate: new Date(),
      totalAmount: totalSum,
      schedule: true,
      netAmount,
      scheduleId: new mongoose.Types.ObjectId(schedule._id),
      startDate,
      endDate,
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

  static async fetchOrderService(payload: Partial<IOrder>, locals: any) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "Order",
    )

    if (error) return { success: false, msg: error }

    let extra = {}
    if (locals?.userType === "user") {
      extra = { orderedBy: new mongoose.Types.ObjectId(locals._id) }
    }

    const order = await OrderRepository.fetchOrderByParams({
      ...params,
      ...extra,
      limit,
      skip,
      sort,
    })

    if (order.length < 1)
      return { success: true, msg: orderMessages.NOT_FOUND, data: [] }

    return {
      success: true,
      msg: orderMessages.FETCH_SUCCESS,
      data: order,
    }
  }

  static async updateOrderService(
    orderId: any,
    data: Partial<IOrder>,
    locals: string,
  ) {
    const { orderStatus, pickUpCode, confirmDelivery } = data
    const findOrder = await OrderRepository.fetchOrder(
      { _id: new mongoose.Types.ObjectId(orderId) },
      {},
    )

    if (!findOrder)
      return { success: false, msg: orderMessages.NOT_FOUND, data: [] }

    if (confirmDelivery) {
      const updateOrder = await OrderRepository.updateOrderDetails(
        {
          _id: new mongoose.Types.ObjectId(orderId),
          confirmDelivery: false,
          assignedRider: new mongoose.Types.ObjectId(locals),
          paymentStatus: "paid",
        },
        { confirmDelivery: true },
      )

      if (!updateOrder)
        return {
          success: false,
          msg: `Invalid order or duplicate confirmation`,
        }

      try {
        let userName = updateOrder?.userName
        let orderCode = updateOrder?.orderCode
        const substitutional_parameters = {
          name: `${userName}`,
          code: `${orderCode}`,
        }

        await sendMailNotification(
          updateOrder?.userEmail,
          "Order Code",
          substitutional_parameters,
          "ORDER_CODE",
        )
      } catch (error) {
        console.log("error", error)
      }

      await RiderRepository.updateRiderDetails(
        { _id: new mongoose.Types.ObjectId(updateOrder.assignedRider) },
        { $inc: { wallet: updateOrder.ridersFee.toFixed(2) } },
      )
    }

    if (pickUpCode) {
      const order = await OrderRepository.updateOrderDetails(
        { _id: new mongoose.Types.ObjectId(findOrder._id) },
        {
          assignedRider: new mongoose.Types.ObjectId(locals),
          riderStatus: "picked",
        },
      )
      if (!order) return { success: false, msg: `Invalid pick-up code` }

      return { success: true, msg: `order successfully assigned to rider` }
    }

    if (orderStatus === "completed") {
      if (findOrder.isWallet) {
        const user = await UserRepository.fetchUser(
          { _id: new mongoose.Types.ObjectId(findOrder.orderedBy) },
          {},
        )
        if (!user) return { success: false, msg: `buyer not found` }

        // Ensure findOrder.totalAmount is defined or provide a default value of 0
        const totalAmount: any = findOrder.totalAmount
        const netAmount: any = findOrder.netAmount
        await VendorRepository.updateVendorDetails(
          { vendorId: findOrder.vendorId },
          { $inc: { wallet: netAmount } },
        )

        await Promise.all([
          await UserRepository.updateUsersProfile(
            { _id: new mongoose.Types.ObjectId(user._id) },
            { $inc: { wallet: -totalAmount } },
          ),

          await TransactionRepository.create({
            userId: new mongoose.Types.ObjectId(user._id),
            vendorId: new mongoose.Types.ObjectId(findOrder.vendorId),
            amount: totalAmount,
            channel: "afrilish",
            status: "completed",
            paymentFor: "debit-wallet",
          }),
        ])
      } else {
        const user = await UserRepository.fetchUser(
          { _id: new mongoose.Types.ObjectId(findOrder.orderedBy) },
          {},
        )
        if (!user) return { success: false, msg: `buyer not found` }

        // Ensure findOrder.totalAmount is defined or provide a default value of 0
        const netAmount: any = findOrder.netAmount
        await VendorRepository.updateVendorDetails(
          { vendorId: findOrder.vendorId },
          { $inc: { wallet: netAmount } },
        )
      }
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

  static async orderAnalysisService(payload: any, query: any) {
    const vendor = await VendorRepository.fetchVendor(
      { partnerId: new mongoose.Types.ObjectId(payload) },
      {},
    )

    if (!vendor) return { success: false, msg: `vendor not available` }

    let dateFilter
    if (query.timeFrame === "weekly") {
      dateFilter = {
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      }
    } else if (query.timeFrame === "monthly") {
      dateFilter = {
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      }
    } else if (query.timeFrame === "yearly") {
      dateFilter = {
        createdAt: {
          $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        },
      }
    }

    const totalOrders = await OrderRepository.fetchAllOrders({
      vendorId: new mongoose.Types.ObjectId(vendor._id),
      isConfirmed: true,
      ...dateFilter,
    })
    const payment = await OrderRepository.fetchAllOrders({
      vendorId: new mongoose.Types.ObjectId(vendor._id),
      paymentStatus: "paid",
      orderStatus: "completed",
      isConfirmed: true,
      ...dateFilter,
    })

    const orderCompleted = await OrderRepository.fetchAllOrders({
      vendorId: new mongoose.Types.ObjectId(vendor._id),
      paymentStatus: "paid",
      orderStatus: "completed",
      isConfirmed: true,
      ...dateFilter,
    })

    const totalPayment = payment.reduce((accumulator, currentExpense) => {
      return accumulator + currentExpense.totalAmount.valueOf()
    }, 0)

    return {
      success: true,
      msg: orderMessages.FETCH_SUCCESS,
      data: {
        totalOrders: totalOrders.length,
        totalPayment,
        orderCompleted: orderCompleted.length,
      },
    }
  }

  static async adminOrderAnalysisService() {
    const order = await OrderRepository.adminOrderAnalysis()

    if (!order) return { success: true, msg: orderMessages.FETCH_ERROR }

    return {
      success: true,
      msg: orderMessages.FETCH_SUCCESS,
      data: order,
    }
  }
}
