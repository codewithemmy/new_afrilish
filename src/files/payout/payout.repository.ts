import { FilterQuery, UpdateQuery } from "mongoose"
import pagination, { IPagination } from "../../constants"
import { IPayout } from "./payout.interface"
import Payout from "./payout.model"

const { LIMIT, SKIP, SORT } = pagination

export default class ClassRepository {
  static async createPayout(payload: Partial<IPayout>): Promise<IPayout> {
    return Payout.create(payload)
  }

  static async fetchPayout(
    payload: Partial<IPayout> | FilterQuery<Partial<IPayout>>,
    select: Partial<Record<keyof IPayout, number | Boolean | object>>,
  ): Promise<Partial<IPayout> | null> {
    const payout: Awaited<IPayout | null> = await Payout.findOne(
      {
        ...payload,
      },
      select,
    ).lean()

    return payout
  }

  static async fetchPayoutByParams(
    payload: FilterQuery<Partial<IPayout & IPagination>>,
  ) {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = payload

    const payout: Awaited<IPayout[] | null> = await Payout.find({
      ...restOfPayload,
    })
      .populate({
        path: "recipient",
        select: "email name fullName firstName lastName",
      })
      .populate({
        path: "initiatorId",
        select: "email name fullName firstName lastName",
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return payout
  }

  static async updatePayoutDetails(
    payload: any,
    update: UpdateQuery<Partial<IPayout>>,
  ) {
    const updatePayout = await Payout.findOneAndUpdate(
      {
        ...payload,
      },
      { ...update },
      { new: true, runValidators: true }, //returns details about the update
    )

    return updatePayout
  }

  static async deletePayoutDetails(payload: Partial<IPayout>) {
    const payout = await Payout.findByIdAndDelete({
      ...payload,
    })

    return payout
  }
}
