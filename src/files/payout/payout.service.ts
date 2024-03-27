import mongoose from "mongoose"
import { IResponse } from "../../constants"
import { queryConstructor } from "../../utils"
import PayoutRepository from "./payout.repository"
import { payoutMessages } from "./payout.messages"
import { IPayout } from "./payout.interface"
import RiderRepository from "../rider/rider.repository"
import VendorRepository from "../partner/vendor/vendor.repository"

export default class PayoutService {
  static async createPayout(
    payload: Partial<IPayout>,
    locals: any,
  ): Promise<IResponse> {
    let { recipient, userType, status } = payload
    if (!locals.isAdmin) {
      payload = {
        title: "Payout Request",
        userType: payload.userType,
        initiator: payload.userType,
        initiatorId: locals._id,
        recipient: locals.vendorId,
        amount: payload.amount,
      }
    }

    let user =
      userType === "Rider"
        ? await RiderRepository.fetchRider(
            { _id: new mongoose.Types.ObjectId(payload.recipient) },
            {},
          )
        : await VendorRepository.fetchVendor(
            { _id: new mongoose.Types.ObjectId(payload.recipient) },
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

    const payout = await PayoutRepository.createPayout({
      ...payload,
      initiatorId: locals._id,
    })

    if (!payout) return { success: false, msg: payoutMessages.PAYOUT_FAILURE }

    if (userType === "Rider" && status === "confirmed") {
      await RiderRepository.updateRiderDetails(
        { _id: new mongoose.Types.ObjectId(recipient) },
        { $inc: { wallet: -amount } },
      )
    }

    if (userType === "Vendor" && status === "confirmed") {
      await VendorRepository.updateVendorDetails(
        { _id: new mongoose.Types.ObjectId(recipient) },
        { $inc: { wallet: -amount } },
      )
    }

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
    const { userType, ...restOfData } = data
    if (!userType) {
      return {
        success: false,
        msg: `userType cannot be empty. Must be either "Rider" or "Vendor"`,
      }
    }
    const payout = await PayoutRepository.updatePayoutDetails(
      { _id: new mongoose.Types.ObjectId(payoutId), status: "pending" },
      {
        $set: {
          ...restOfData,
        },
      },
    )

    if (!payout) return { success: false, msg: payoutMessages.UPDATE_ERROR }

    if (userType === "Rider" && data?.status === "confirmed") {
      await RiderRepository.updateRiderDetails(
        { _id: new mongoose.Types.ObjectId(payout.recipient) },
        { $inc: { wallet: -data.amount! } },
      )
    }

    if (userType === "Vendor" && data?.status === "confirmed") {
      await VendorRepository.updateVendorDetails(
        { _id: new mongoose.Types.ObjectId(payout.recipient) },
        { $inc: { wallet: -data.amount! } },
      )
    }

    return { success: true, msg: payoutMessages.UPDATE_SUCCESS }
  }
}
