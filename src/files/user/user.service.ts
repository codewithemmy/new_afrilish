import mongoose from "mongoose"
import { IResponse } from "../../constants"
import {
  AlphaNumeric,
  hashPassword,
  queryConstructor,
  tokenHandler,
  verifyPassword,
} from "../../utils"
import { ICoord, IUser } from "./user.interface"
import UserRepository from "./user.repository"
import { userMessages } from "./user.messages"
import { sendMailNotification } from "../../utils/email"
import { generalMessages } from "../../core/messages"
import { IVendor } from "../partner/partner.interface"
import { partnerMessages } from "../partner/partner.messages"
import { decode } from "jsonwebtoken"

export default class UserService {
  static async createUser(userPayload: IUser): Promise<IResponse> {
    let { phone, email, fullName, password } = userPayload

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

    if (validateUser) return { success: false, msg: userMessages.DETAILS }

    const encryptPassword = await hashPassword(password)
    const otp = AlphaNumeric(4, "numbers")

    const user = await UserRepository.createUser({
      ...userPayload,
      password: encryptPassword,
      verificationOtp: otp,
    })

    if (!user) return { success: false, msg: userMessages.USER_FAILURE }

    // send mail login details to user
    try {
      await sendMailNotification(
        email,
        "Registration",
        {
          name: fullName,
          otp,
          email,
        },
        "USER_REG",
      )
    } catch (error) {
      console.log("error", error)
    }

    const userToken = await tokenHandler({ _id: user._id })

    return {
      success: true,
      msg: userMessages.USER_SUCCESS,
      data: { userToken },
    }
  }

  static async verifyUserService(payload: { otp: string; email: string }) {
    const { otp, email } = payload

    const confirmOtp = await UserRepository.fetchUser(
      { verificationOtp: otp, email },
      {},
    )

    if (!confirmOtp)
      return { success: false, msg: partnerMessages.INCORRECT_INFO }

    await UserRepository.updateUsersProfile(
      { _id: new mongoose.Types.ObjectId(confirmOtp._id) },
      { verificationOtp: "", isVerified: true },
    )

    return {
      success: true,
      msg: partnerMessages.VERIFIED,
    }
  }

  static async resendVerificationService(
    userPayload: IUser,
  ): Promise<IResponse> {
    let { email } = userPayload

    const findPartner = await UserRepository.fetchUser({ email }, {})

    const otp = AlphaNumeric(4, "numbers")

    const fullName: any = findPartner?.fullName

    const user = await UserRepository.updateUsersProfile(
      { email },
      { verificationOtp: otp },
    )

    if (!user) return { success: false, msg: userMessages.FETCH_ERROR }

    // send mail login details to partner
    try {
      const substitutional_parameters = {
        name: fullName,
        email: email,
        otp,
      }

      await sendMailNotification(
        email,
        "Sign-Up",
        substitutional_parameters,
        "USER_REG",
      )
    } catch (error) {
      console.log("error", error)
    }

    return {
      success: true,
      msg: partnerMessages.OTP,
    }
  }

  static async loginUser(userPayload: Pick<IUser, "email" | "password">) {
    const { email, password } = userPayload
    const user = await UserRepository.fetchUser({ email }, {})

    if (!user) return { success: false, msg: userMessages.FETCH_ERROR }
    if (!user?.password)
      return { success: false, msg: `User not authenticated with password` }

    const validatePassword = await verifyPassword(password!, user.password!)

    if (!validatePassword)
      return { success: false, msg: generalMessages.INCORRECT }

    user.password = undefined

    const token = tokenHandler({ ...user, userType: "user" })

    return {
      success: true,
      msg: generalMessages.SUCCESSFUL_LOGIN,
      data: {
        _id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        token,
      },
    }
  }

  static async forgotPasswordService(payload: { email: string }) {
    const { email } = payload
    const user = await UserRepository.fetchUser({ email: email }, {})

    if (!user) return { success: false, msg: userMessages.FETCH_ERROR }

    const generateOtp = AlphaNumeric(4, "number")

    await UserRepository.updateUsersProfile(
      { email },
      { verificationOtp: generateOtp },
    )

    /**send otp to email or phone number*/
    const substitutional_parameters = {
      resetOtp: generateOtp,
    }

    try {
      await sendMailNotification(
        email,
        "Reset Password",
        substitutional_parameters,
        "RESET_OTP",
      )
    } catch (error) {
      console.log("error", error)
    }

    return { success: true, msg: userMessages.OTP }
  }

  static async resetPasswordService(userPayload: {
    otp: string
    newPassword: string
    email: string
  }) {
    const { newPassword, email, otp } = userPayload

    const user = await UserRepository.fetchUser(
      {
        email,
        verificationOtp: otp,
      },
      {},
    )

    if (!user) return { success: false, msg: userMessages.FETCH_ERROR }

    const updateUser = await UserRepository.updateUsersProfile(
      { email },
      { password: await hashPassword(newPassword), verificationOtp: "" },
    )

    if (!updateUser) return { success: false, msg: userMessages.UPDATE_ERROR }

    return { success: true, msg: userMessages.UPDATE_SUCCESS }
  }

  static async fetchUserService(userPayload: Partial<IUser>, locals: any) {
    const { error, params, limit, skip, sort } = queryConstructor(
      userPayload,
      "createdAt",
      "User",
    )

    if (error) return { success: false, msg: error }
    let id: any

    if (locals.isAdmin) {
      id = {}
    } else {
      id = { _id: new mongoose.Types.ObjectId(locals._id) }
    }

    const user = await UserRepository.fetchUserByParams({
      ...params,
      ...id,
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
      totalUsers: user.length,
    }
  }

  static async updateUserProfile(data: {
    params: any
    userPayload: Partial<IUser & ICoord>
  }) {
    const { params, userPayload } = data
    const { lng, lat, ...restOfPayload } = userPayload
    let locationCoord

    if (lng && lat) {
      let latChange = lat.toString()
      let lngChange = lng.toString()

      locationCoord = {
        type: "Point",
        coordinates: [parseFloat(lngChange), parseFloat(latChange)],
      }
    }

    const user = await UserRepository.updateUsersProfile(
      { _id: new mongoose.Types.ObjectId(params) },
      {
        $set: {
          ...restOfPayload,
          locationCoord,
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

  static async getVendorByCoordService(query: Partial<IVendor>) {
    const { error, params, limit, skip, sort } = queryConstructor(
      query,
      "createdAt",
      "Vendor",
    )

    if (error) return { success: false, msg: error }

    const { vendorType } = query

    let extra = { isAvailable: true }
    let privateVendor = {}

    if (vendorType === "privateVendor") {
      privateVendor = { vendorType: "privateVendor" }
    }
    const vendors = await UserRepository.getVendorByCoord({
      ...params,
      limit,
      skip,
      sort,
      ...extra,
      ...privateVendor,
    })

    if (vendors.length < 1)
      return {
        success: true,
        msg: `No vendor currently available in your chosen location, we are working on it. Thank you`,
        data: [],
      }

    return {
      success: true,
      msg: userMessages.FETCH_SUCCESS,
      data: vendors,
    }
  }

  static async userAuthLoginService(userPayload: {
    fullName?: string
    email?: string
    authType?: string
    action?: string
    jwtToken?: string
  }) {
    const { fullName, email, authType, action, jwtToken } = userPayload

    if (!authType) return { success: false, msg: `Auth type cannot be empty` }

    let appleEmail: any
    if (action === "login") {
      let user: any
      if (authType === "apple" && jwtToken) {
        const decoded: any = decode(jwtToken)
        appleEmail = decoded?.email
        user = await UserRepository.fetchUser(
          { email: appleEmail, authType },
          {},
        )
        if (!user) {
          return { success: false, msg: `user not found` }
        }
      } else {
        user = await UserRepository.fetchUser({ email, authType }, {})

        if (!user) {
          return { success: false, msg: `user not found` }
        }
      }

      const token = tokenHandler({
        _id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        isPartner: false,
      })

      return {
        success: true,
        msg: generalMessages.SUCCESSFUL_LOGIN,
        data: {
          _id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          token,
        },
      }
    }

    let user
    if (jwtToken) {
      const decoded: any = decode(jwtToken)
      appleEmail = decoded?.email

      const confirmUser = await UserRepository.fetchUser(
        { email: appleEmail, authType },
        {},
      )

      if (confirmUser) {
        return { success: false, msg: `user already exist` }
      }
      user = await UserRepository.createUser({
        email: appleEmail,
        isVerified: true,
        authType,
      })
    } else {
      const confirmUser = await UserRepository.fetchUser(
        { email, authType },
        {},
      )

      if (confirmUser) {
        return { success: false, msg: `user already exist` }
      }
      user = await UserRepository.createUser({
        email: email,
        fullName: fullName,
        isVerified: true,
        authType,
      })
    }

    const userEmail: any = user.email
    const userFullName: any = fullName
    // send mail login details to user
    try {
      await sendMailNotification(
        userEmail,
        "Registration",
        {
          name: userFullName,
          email: userEmail,
        },
        "USER_REG_AUTH",
      )
    } catch (error) {
      console.log("error", error)
    }

    const token = tokenHandler({
      _id: user._id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      isPartner: false,
    })

    return {
      success: true,
      msg: generalMessages.SUCCESSFUL_LOGIN,
      data: {
        _id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        token,
      },
    }
  }

  static async userSupportService(userPayload: {
    email: string
    message: string
  }) {
    const { message, email } = userPayload
    // send mail login details to user
    try {
      await sendMailNotification(
        "info@afrilish.com",
        "Support/Report",
        {
          email: email,
          message,
        },
        "SUPPORT",
      )
    } catch (error) {
      console.log("error", error)
    }
    return {
      success: true,
      msg: `support sent successfully`,
    }
  }
}
