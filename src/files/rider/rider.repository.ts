import { FilterQuery, UpdateQuery } from "mongoose"
import pagination, { IPagination } from "../../constants"
import { IRider } from "./rider.interface"
import Rider from "./rider.model"

const { LIMIT, SKIP, SORT } = pagination

export default class RiderRepository {
  static async createRider(riderPayload: Partial<IRider>): Promise<IRider> {
    return Rider.create(riderPayload)
  }

  static async fetchRider(
    riderPayload: Partial<IRider> | FilterQuery<Partial<IRider>>,
    select: Partial<Record<keyof IRider, number | Boolean | object>>,
  ): Promise<Partial<IRider> | null> {
    const rider: Awaited<IRider | null> = await Rider.findOne(
      {
        ...riderPayload,
      },
      select,
    ).lean()

    return rider
  }

  static async fetchRiderByParams(riderPayload: Partial<IRider & IPagination>) {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = riderPayload

    const rider: Awaited<IRider[] | null> = await Rider.find({
      ...restOfPayload,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return rider
  }

  static async updateRiderDetails(
    riderPayload: Partial<IRider>,
    update: UpdateQuery<Partial<IRider>>,
  ) {
    const updateRider = await Rider.findOneAndUpdate(
      {
        ...riderPayload,
      },
      { ...update },
      { new: true, runValidators: true }, //returns details about the update
    )

    return updateRider
  }

  static async deleteRiderDetails(riderPayload: Partial<IRider>) {
    const deleteRider = await Rider.findOneAndDelete({
      ...riderPayload,
    })

    return deleteRider
  }
}
