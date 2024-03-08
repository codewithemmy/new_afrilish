import mongoose from "mongoose"
import { IResponse } from "../../constants"
import { queryConstructor } from "../../utils"
import PayoutRepository from "./payout.repository"
import { payoutMessages } from "./payout.messages"
import { IPayout } from "./payout.interface"
import RiderRepository from "../rider/rider.repository"
import VendorRepository from "../partner/vendor/vendor.repository"

export default class PayoutService {
  static async createPayout(payload: Partial<IPayout>): Promise<IResponse> {
    const { recipient, userType } = payload

    let user =
      userType === "Rider"
        ? await RiderRepository.fetchRider(
            { _id: new mongoose.Types.ObjectId(recipient) },
            {},
          )
        : await VendorRepository.fetchVendor(
            { _id: new mongoose.Types.ObjectId(recipient) },
            {},
          )

    if (!user)
      return { success: false, msg: `Invalid user or user not available` }

    let amount: Number = payload.amount!
    let wallet: Number = user?.wallet!

    if (amount > wallet)
      return { success: false, msg: `Amount not available for payout` }

    let currentDate = new Date()
    currentDate.setDate(currentDate.getDate() - 6)

    const days = await PayoutRepository.fetchPayoutByParams({
      recipient: new mongoose.Types.ObjectId(recipient),
      createdAt: { $gte: currentDate },
    })

    if (days)
      return {
        success: false,
        msg: `Likely invalid payout date`,
      }

    const payout = await PayoutRepository.createPayout({ ...payload })

    if (!payout) return { success: false, msg: payoutMessages.PAYOUT_FAILURE }

    return {
      success: true,
      msg: payoutMessages.PAYOUT_SUCCESS,
    }
  }

  static async fetchPayoutService(payload: Partial<IPayout>) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "Payout",
    )

    if (error) return { success: false, msg: error }

    const payout = await PayoutRepository.fetchPayoutByParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (payout.length < 1)
      return { success: false, msg: payoutMessages.NOT_FOUND, data: [] }

    return {
      success: true,
      msg: payoutMessages.FETCH_SUCCESS,
      data: payout,
    }
  }

  static async updatePayoutService(payoutId: any, data: Partial<IPayout>) {
    const partner = await PayoutRepository.updatePayoutDetails(
      { _id: new mongoose.Types.ObjectId(payoutId) },
      {
        $set: {
          ...data,
        },
      },
    )

    if (!partner) return { success: false, msg: payoutMessages.UPDATE_ERROR }

    return { success: true, msg: payoutMessages.UPDATE_SUCCESS }
  }
}
