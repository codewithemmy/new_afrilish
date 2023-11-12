import mongoose, { mongo } from "mongoose"
import { IResponse } from "../../constants"
import { deg2rad, genRandomNumber, queryConstructor } from "../../utils"
import OrderRepository from "./order.repository"
import { orderMessages } from "./order.messages"
import { IOrder } from "./order.interface"
import VendorRepository from "../partner/vendor/vendor.repository"
import { partnerMessages } from "../partner/partner.messages"
import UserRepository from "../user/user.repository"
import Item from "../item/item.model"
import ItemRepository from "../item/item.repository"

export default class OrderService {
  static async createOrder(
    orderPayload: {
      vendorId: string
      lng: any
      lat: any
      item: [any]
      note: string
    },
    locals: any,
  ): Promise<IResponse> {
    const { vendorId, lng, lat, item, note } = orderPayload

    const vendor = await VendorRepository.fetchVendor(
      {
        _id: new mongoose.Types.ObjectId(vendorId),
      },
      {},
    )
    if (!vendor) return { success: false, msg: partnerMessages.FETCH_ERROR }

    let vendorLng: any
    let vendorLat: any

    // Check if vendor.locationCoord is defined before accessing its properties
    if (vendor.locationCoord && vendor.locationCoord.coordinates) {
      vendorLng = vendor.locationCoord.coordinates[0]
      vendorLat = vendor.locationCoord.coordinates[1]
    } else {
      // Handle the case where locationCoord or coordinates is undefined
      return {
        success: false,
        msg: "Location coordinates not available for the vendor.",
      }
    }

    let dLng: any = lng - vendorLng
    let dLat: any = lat - vendorLat
    const R = 6371 // Earth's radius in kilometers
    const lngResult = deg2rad(dLng)
    const latResult = deg2rad(dLat)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(vendorLat)) *
        Math.cos(deg2rad(lat)) *
        Math.sin(lngResult / 2) *
        Math.sin(latResult / 2)

    const c: any = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance: Number = R * c

    let kilometers: any = distance.toFixed(2)

    let ridersFee: Number = kilometers * 2

    const customer = await UserRepository.fetchUser(
      { _id: new mongoose.Types.ObjectId(locals._id) },
      {},
    )

    let cartItems: [any]
    let netAmount: any = 0

    //confirm item
    let confirmItem = await Item.find()
      .where("_id")
      .in(item.map((result) => result._id))
      .exec()

    //map food and compare with id from req.body array
    confirmItem.map((result) => {
      item.map(({ _id, quantity }) => {
        if (result._id == new mongoose.Types.ObjectId(_id)) {
          let price: any = result.price
          netAmount += price * quantity

          cartItems.push({ result, quantity })
        }
      })
    })
    const deliveryFee: Number = 2
    const marketPlace: Number = 3

    let totalPrice: any = netAmount + deliveryFee + marketPlace + ridersFee
    let roundTotalPrice: Number = Math.ceil(totalPrice)

    let serviceCharge: Number = (10 * totalPrice) / 100

    let pickUpNumber = genRandomNumber()
    let parsePickUpNumber = Number(pickUpNumber)
    let orderCode = genRandomNumber()
    let parseOrderCode = Number(orderCode)

    const currentOrder = await OrderRepository.createOrder({
      pickUpCode: parsePickUpNumber,
      orderCode: parseOrderCode,
      // item: cartItems,
      orderedBy: new mongoose.Types.ObjectId(locals._id),
      vendorId: new mongoose.Types.ObjectId(vendor._id),
      locationCoord: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      userEmail: locals.email,
      ridersFee,
      userName: locals.fullName,
      addNote: note,
      serviceCharge,
      orderDate: new Date(),
      totalAmount: roundTotalPrice,
      netAmount,
    })

    if (!currentOrder)
      return { success: false, msg: orderMessages.ORDER_FAILURE }

    return {
      success: true,
      msg: orderMessages.ORDER_SUCCESS,
      data: currentOrder,
    }
  }
}
