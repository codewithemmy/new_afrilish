import { FilterQuery, UpdateQuery } from "mongoose"
import pagination, { IPagination } from "../../constants"
import { ICoord, IUser } from "./user.interface"
import User from "./user.model"
import Vendor from "../partner/vendor/vendor.model"
import { IVendorSearch } from "../partner/partner.interface"

const { LIMIT, SKIP, SORT } = pagination

export default class UserRepository {
  static async createUser(userPayload: Partial<IUser>): Promise<IUser> {
    return User.create(userPayload)
  }

  static async fetchUser(
    userPayload: Partial<IUser> | FilterQuery<Partial<IUser>>,
    select: Partial<Record<keyof IUser, number | Boolean | object>>,
  ): Promise<Partial<IUser> | null> {
    const user: Awaited<IUser | null> = await User.findOne(
      {
        ...userPayload,
      },
      select,
    ).lean()

    return user
  }

  static async fetchUserByParams(userPayload: Partial<IUser & IPagination>) {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = userPayload

    const user: Awaited<IUser[] | null> = await User.find({
      ...restOfPayload,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return user
  }

  static async updateUsersProfile(
    userPayload: Partial<IUser>,
    update: UpdateQuery<Partial<IUser>>,
  ) {
    const updateUser = await User.findOneAndUpdate(
      {
        ...userPayload,
      },
      { ...update },
      { new: true, runValidators: true }, //returns details about the update
    )

    return updateUser
  }

  static async getVendorByCoord(
    userPayload: Partial<IVendorSearch & IPagination & ICoord>,
  ) {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = userPayload

    let { lat, lng, search, ...extraParams } = restOfPayload
    if (!search) search = ""

    if (lat && lng) {
      let latToString: any = lat?.toString()
      let lngToString: any = lng?.toString()

      let latString: string = latToString
      let lngString: string = lngToString

      const floatString = "10000"

      const vendor = await Vendor.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [parseFloat(lngString), parseFloat(latString)],
            },
            key: "locationCoord",
            maxDistance: parseFloat(floatString),
            distanceField: "distance",
            spherical: true,
          },
        },
        {
          $lookup: {
            from: "item",
            localField: "itemId",
            foreignField: "_id",
            as: "items",
          },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  { name: { $regex: search, $options: "i" } },
                  { price: { $regex: search, $options: "i" } },
                  { address: { $regex: search, $options: "i" } },
                  { email: { $regex: search, $options: "i" } },
                  { "items.name": { $regex: search, $options: "i" } },
                ],
                ...extraParams,
              },
            ],
          },
        },
      ])
        .sort(sort)
        .skip(skip)
        .limit(limit)

      return vendor
    } else {
      // lng and lat not provided, perform query without $geoNear
      const vendor = await Vendor.aggregate([
        {
          $lookup: {
            from: "item",
            localField: "itemId",
            foreignField: "_id",
            as: "items",
          },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  { name: { $regex: search, $options: "i" } },
                  { price: { $regex: search, $options: "i" } },
                  { address: { $regex: search, $options: "i" } },
                  { email: { $regex: search, $options: "i" } },
                  { "items.name": { $regex: search, $options: "i" } },
                ],
                ...extraParams,
              },
            ],
          },
        },
      ])
        .sort(sort)
        .skip(skip)
        .limit(limit)

      return vendor
    }
  }
}
