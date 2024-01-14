import mongoose, { Date } from "mongoose"
import { IResponse } from "../../../constants"
import { IRider } from "../rider.interface"
import RiderRepository from "../rider.repository"
import { riderMessages } from "../rider.messages"
import { sendMailNotification } from "../../../utils/email"
import { generalMessages } from "../../../core/messages"

export default class RiderService {
  static async riderProfile(locals: any) {
    const rider = await RiderRepository.fetchRider(
      { _id: new mongoose.Types.ObjectId(locals) },
      { fullName: 1, email: 1, phone: 1, image: 1, wallet: 1, rating: 1 },
    )

    if (!rider) return { success: false, msg: riderMessages.FETCH_ERROR }

    return {
      success: true,
      msg: riderMessages.FETCH_SUCCESS,
      data: rider,
    }
  }
}
