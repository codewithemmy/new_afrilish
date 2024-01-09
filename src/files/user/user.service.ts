import mongoose from "mongoose"
import { IResponse } from "../../constants"
import { AlphaNumeric, queryConstructor, tokenHandler } from "../../utils"
import { ICoord, IUser } from "./user.interface"
import UserRepository from "./user.repository"
import { userMessages } from "./user.messages"
import { sendMailNotification } from "../../utils/email"
import { generalMessages } from "../../core/messages"
import { IVendor } from "../partner/partner.interface"
import { partnerMessages } from "../partner/partner.messages"

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

    if (validateUser) return { success: false, msg: userMessages.DETAILS }

    const otp = AlphaNumeric(4, "numbers")

    const user = await UserRepository.createUser({
      ...userPayload,
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
          imageUrl:
            "https://res.cloudinary.com/dn6eonkzc/image/upload/v1684420375/DEV/vlasbjyf9antscatbgzt.webp",
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
        imageUrl:
          "https://res.cloudinary.com/dn6eonkzc/image/upload/v1684420375/DEV/vlasbjyf9antscatbgzt.webp",
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

  static async loginCodeService(userPayload: Pick<IUser, "email">) {
    const { email } = userPayload
    const user = await UserRepository.fetchUser({ email }, {})

    if (!user) return { success: false, msg: generalMessages.EMAIL_INCORRECT }

    const randomNumber = AlphaNumeric(4, "number")

    const updateUser = await UserRepository.updateUsersProfile(
      { email },
      { loginCode: randomNumber },
    )

    if (!updateUser) return { success: false, msg: userMessages.OTP_FAILURE }

    let fullName: any = user.fullName

    // send mail login details to user
    try {
      await sendMailNotification(
        email,
        "Login Code",
        {
          name: fullName,
          email,
          otp: randomNumber,
          imageUrl:
            "https://res.cloudinary.com/dn6eonkzc/image/upload/v1684420375/DEV/vlasbjyf9antscatbgzt.webp",
        },
        "USER_CODE",
      )
    } catch (error) {
      console.log("error", error)
    }

    return {
      success: true,
      msg: userMessages.OTP_SENT,
    }
  }

  static async loginUser(userPayload: Partial<IUser>) {
    const { loginCode, email } = userPayload
    const user = await UserRepository.fetchUser({ loginCode, email }, {})

    if (!user) return { success: false, msg: userMessages.INCORRECT_CODE }

    await UserRepository.updateUsersProfile(
      { email, loginCode },
      { loginCode: "" },
    )

    const token = tokenHandler({
      ...user,
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

  static async fetchUserService(userPayload: Partial<IUser>, locals: any) {
    const { error, params, limit, skip, sort } = queryConstructor(
      userPayload,
      "createdAt",
      "User",
    )

    if (error) return { success: false, msg: error }

    let id = { _id: new mongoose.Types.ObjectId(locals) }

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
        coordinates: [parseFloat(latChange), parseFloat(lngChange)],
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

    let extra = { isAvailable: true }

    const vendors = await UserRepository.getVendorByCoord({
      ...params,
      limit,
      skip,
      sort,
      ...extra,
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

  static async userAuthLoginService(userPayload: Partial<IUser>) {
    const { fullName, email } = userPayload

    const confirmUser = await UserRepository.fetchUser({ email }, {})

    if (confirmUser) {
      const token = tokenHandler({
        ...confirmUser,
        isPartner: false,
      })

      return {
        success: true,
        msg: generalMessages.SUCCESSFUL_LOGIN,
        data: {
          _id: confirmUser._id,
          fullName: confirmUser.fullName,
          phone: confirmUser.phone,
          email: confirmUser.email,
          token,
        },
      }
    }

    const user = await UserRepository.createUser({
      email: email,
      fullName: fullName,
      isVerified: true,
    })

    const userEmail: any = email
    const userFullName: any = userEmail
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
      ...user,
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
          imageUrl:
            "https://res.cloudinary.com/dn6eonkzc/image/upload/v1684420375/DEV/vlasbjyf9antscatbgzt.webp",
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
