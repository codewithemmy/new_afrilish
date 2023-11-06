import mongoose from "mongoose"
import { IResponse } from "../../constants"
import {
  AlphaNumeric,
  hashPassword,
  queryConstructor,
  tokenHandler,
  verifyPassword,
} from "../../utils"
import { IUser } from "./user.interface"
import UserRepository from "./user.repository"
import { userMessages } from "./user.messages"
import { sendMailNotification } from "../../utils/email"
import { generalMessages } from "../../core/messages"

export default class UserService {
  static async createUser(userPayload: IUser): Promise<IResponse> {
    let { phone, email, fullName } = userPayload

    // check if user exists using phone or email
    const validateUser = await UserRepository.fetchUser(
      {
        $or: [
          {
            phone,
          },
          {
            email,
          },
        ],
      },
      {
        _id: 1,
      },
    )

    if (validateUser) return { success: true, msg: userMessages.EXISTING_USER }

    const user = await UserRepository.createUser({
      ...userPayload,
    })

    if (!user) return { success: false, msg: userMessages.NOT_FOUND }

    // send mail login details to user
    try {
      await sendMailNotification(
        email,
        "Registration",
        { fullName, email },
        "REGISTRATION",
      )
    } catch (error) {
      console.log("error", error)
    }

    return {
      success: true,
      msg: userMessages.USER_SUCCESS,
      data: user,
    }
  }

  static async loginUser(userPayload: Pick<IUser, "phone">) {
    const { phone } = userPayload
    const user = await UserRepository.fetchUser({ phone }, {})

    if (!user) return { success: false, msg: generalMessages.INCORRECT_DETAILS }

    const token = tokenHandler({ ...user })

    return {
      success: true,
      msg: generalMessages.SUCCESSFUL_LOGIN,
      data: { ...user, token },
    }
  }

  static async fetchUserService(userPayload: Partial<IUser>) {
    const { error, params, limit, skip, sort } = queryConstructor(
      userPayload,
      "createdAt",
      "User",
    )

    if (error) return { success: false, msg: error }

    const user = await UserRepository.fetchUserByParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (user.length < 1)
      return { success: false, msg: userMessages.USER_FAILURE, data: [] }

    return {
      success: true,
      msg: userMessages.FETCH_SUCCESS,
      data: user,
    }
  }

  static async updateUserProfile(data: {
    params: { userId: string }
    userPayload: Partial<IUser>
  }) {
    const { params, userPayload } = data

    const { ...restOfPayload } = userPayload

    const user = await UserRepository.updateUsersProfile(
      { _id: new mongoose.Types.ObjectId(params.userId) },
      {
        $set: {
          ...restOfPayload,
        },
      },
    )

    if (!user) return { success: false, msg: userMessages.UPDATE_ERROR }

    return { success: true, msg: userMessages.UPDATE_SUCCESS }
  }

  static async fetchSingleUser(data: any) {
    const user = await UserRepository.fetchUser(
      {
        _id: new mongoose.Types.ObjectId(data),
      },
      {},
    )

    if (!user) return { success: false, msg: userMessages.USER_FAILURE }

    return {
      success: true,
      msg: userMessages.USER_SUCCESS,
      data: user,
    }
  }
}
