import mongoose, { Date, mongo } from "mongoose"
import { IPagination, IResponse } from "../../../constants"
import { IRider } from "../rider.interface"
import RiderRepository from "../rider.repository"
import { riderMessages } from "../rider.messages"
import { sendMailNotification } from "../../../utils/email"
import { generalMessages } from "../../../core/messages"
import { ICoord } from "../../user/user.interface"
import { queryConstructor } from "../../../utils"
import OrderRepository from "../../order/order.repository"
import { orderMessages } from "../../order/order.messages"
import { IOrder } from "../../order/order.interface"

export default class RiderService {
  static async riderProfile(locals: any) {
    const rider = await RiderRepository.fetchRider(
      { _id: new mongoose.Types.ObjectId(locals) },
      { fullName: 1, email: 1, phone: 1, image: 1, wallet: 1 },
    )

    if (!rider) return { success: false, msg: riderMessages.FETCH_ERROR }

    return {
      success: true,
      msg: riderMessages.FETCH_SUCCESS,
      data: rider,
    }
  }

  static async updateRiderProfile(data: {
    params: any
    riderPayload: Partial<IRider & ICoord>
  }) {
    const { params, riderPayload } = data
    const { lng, lat, ...restOfPayload } = riderPayload
    let locationCoord

    if (lng && lat) {
      let latChange = lat.toString()
      let lngChange = lng.toString()

      locationCoord = {
        type: "Point",
        coordinates: [parseFloat(lngChange), parseFloat(latChange)],
      }
    }

    const rider = await RiderRepository.updateRiderDetails(
      { _id: new mongoose.Types.ObjectId(params) },
      {
        $set: {
          ...restOfPayload,
          locationCoord,
        },
      },
    )
    if (!rider) return { success: false, msg: riderMessages.UPDATE_ERROR }

    return { success: true, msg: riderMessages.UPDATE_SUCCESS }
  }

  static async deleteRider(id: any) {
    const rider = await RiderRepository.fetchRider(
      { _id: new mongoose.Types.ObjectId(id) },
      {},
    )

    if (!rider) return { success: false, msg: riderMessages.FETCH_ERROR }

    const deleteRider = await RiderRepository.deleteRiderDetails({
      _id: new mongoose.Types.ObjectId(id),
    })

    if (!deleteRider)
      return { success: false, msg: riderMessages.DELETE_FAILURE }

    return { success: true, msg: riderMessages.RIDER_DELETE }
  }

  static async riderDocumentUpload(
    data: { image: string; body: any },
    params: any,
  ) {
    const { image, body } = data
    const rider = await RiderRepository.updateRiderDetails(
      { _id: new mongoose.Types.ObjectId(params) },
      {
        $set: { document: { image, ...body } },
      },
    )
    if (!rider) return { success: false, msg: riderMessages.UPDATE_ERROR }

    return { success: true, msg: `Document upload successful` }
  }

  static async getOrderByCoordService(
    query: Partial<IOrder & ICoord>,
    locals: string,
  ) {
    const { error, params, limit, skip, sort } = queryConstructor(
      query,
      "createdAt",
      "Order",
    )

    if (error) return { success: false, msg: error }

    const { lat, lng } = query
    let order
    let extra = { assignedRider: new mongoose.Types.ObjectId(locals) }

    if (lat && lng) {
      order = await OrderRepository.fetchOrderLocations({
        ...params,
        limit,
        skip,
        sort,
      })
    } else {
      order = await OrderRepository.riderOrderWithoutLocations({
        ...params,
        limit,
        skip,
        sort,
        ...extra,
      })
    }

    if (order.length < 1)
      return {
        success: true,
        msg: `No order currently available in your location. Thank you`,
        data: [],
      }

    return {
      success: true,
      msg: orderMessages.FETCH_SUCCESS,
      data: order,
      length: order.length,
    }
  }
}
