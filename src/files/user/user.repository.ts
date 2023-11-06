import { FilterQuery, UpdateQuery } from "mongoose"
import pagination, { IPagination } from "../../constants"
import { IUser } from "./user.interface"
import User from "./user.model"

const { LIMIT, SKIP, SORT } = pagination

export default class UserRepository {
  static async createUser(userPayload: IUser): Promise<IUser> {
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
}
