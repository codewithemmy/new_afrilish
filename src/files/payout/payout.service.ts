import mongoose from "mongoose"
import { IResponse } from "../../constants"
import { queryConstructor } from "../../utils"
import PayoutRepository from "./payout.repository"
import { payoutMessages } from "./payout.messages"
import { IPayout } from "./payout.interface"

export default class PayoutService {
  static async createPayout(payload: Partial<IPayout>): Promise<IResponse> {
    const payout = await PayoutRepository.createPayout(payload)

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
      "payout",
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
