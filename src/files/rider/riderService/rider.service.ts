import mongoose, { Date } from "mongoose"
import { IResponse } from "../../../constants"
import {
  AlphaNumeric,
  hashPassword,
  queryConstructor,
  tokenHandler,
  verifyPassword,
} from "../../../utils"
import { IRider } from "../rider.interface"
import RiderRepository from "../rider.repository"
import { riderMessages } from "../rider.messages"
import { sendMailNotification } from "../../../utils/email"
import { generalMessages } from "../../../core/messages"

export default class RiderService {
  static async createRider(riderPayload: {
    email: string
    phone: string
    fullName: string
    password: string
  }): Promise<IResponse> {
    const { password, phone, email, fullName } = riderPayload

    // check if rider exists using phone or email
    const validateRider = await RiderRepository.fetchRider(
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

    if (validateRider)
      return { success: true, msg: riderMessages.EXISTING_RIDER }

    const otp = AlphaNumeric(4, "number")

    const rider = await RiderRepository.createRider({
      ...riderPayload,
      verificationToken: otp,
      password: await hashPassword(password),
    })

    if (!rider) return { success: false, msg: riderMessages.RIDER_FAILURE }

    const substitutional_parameters = {
      name: fullName,
      email: email,
      otp: otp,
    }

    // send mail login details to rider
    try {
      await sendMailNotification(
        email,
        "Registration",
        substitutional_parameters,
        "RIDER_REG",
      )
    } catch (error) {
      console.log("error", error)
    }

    rider.password = ""

    return {
      success: true,
      msg: riderMessages.RIDER_SUCCESS,
    }
  }

  static async resentOtpService(riderPayload: {
    email: string
  }): Promise<IResponse> {
    let { email } = riderPayload

    const rider = await RiderRepository.fetchRider({ email }, {})

    const otp = AlphaNumeric(4, "numbers")

    const fullName: any = rider?.fullName

    const updateRider = await RiderRepository.updateRiderDetails(
      { email },
      { verificationOtp: otp },
    )

    if (!updateRider) return { success: false, msg: riderMessages.UPDATE_ERROR }

    // send mail login details to partner
    try {
      const substitutional_parameters = {
        name: fullName,
        email: email,
        otp,
      }

      await sendMailNotification(
        email,
        "Registration",
        substitutional_parameters,
        "RIDER_REG",
      )
    } catch (error) {
      console.log("error", error)
    }

    const token = tokenHandler({ _id: rider?._id, userType: "rider" })

    return {
      success: true,
      msg: riderMessages.OTP,
      data: { token },
    }
  }

  static async verifyRiderService(payload: { otp: string; email: string }) {
    const { otp, email } = payload

    const confirmOtp = await RiderRepository.fetchRider(
      { verificationToken: otp, email },
      {},
    )

    if (!confirmOtp)
      return { success: false, msg: riderMessages.INCORRECT_INFO }

    await RiderRepository.updateRiderDetails(
      { _id: new mongoose.Types.ObjectId(confirmOtp._id) },
      { verificationToken: "", isVerified: true },
    )

    const name: any = confirmOtp.fullName

    const substitutional_parameters = {
      name: name,
      email: email,
    }

    // send mail login details to rider
    try {
      await sendMailNotification(
        email,
        "Account Verified",
        substitutional_parameters,
        "VERIFY_OTP",
      )
    } catch (error) {
      console.log("error", error)
    }
    return {
      success: true,
      msg: riderMessages.VERIFIED,
    }
  }

  static async loginRider(riderPayload: Pick<IRider, "email" | "password">) {
    const { email, password } = riderPayload

    const rider = await RiderRepository.fetchRider({ email }, {})

    if (!rider) return { success: false, msg: generalMessages.INCORRECT }

    if (!rider.isVerified)
      return { success: false, msg: generalMessages.NOT_VERIFIED }

    const validatePassword = await verifyPassword(password!, rider.password!)
    if (!validatePassword)
      return { success: false, msg: generalMessages.INCORRECT }

    rider.password = undefined

    const token = tokenHandler({ ...rider, userType: "rider" })

    return {
      success: true,
      msg: generalMessages.SUCCESSFUL_LOGIN,
      data: { ...rider, token },
    }
  }

  static async forgotPasswordService(payload: Pick<IRider, "email">) {
    const { email } = payload
    const rider = await RiderRepository.fetchRider({ email: email }, {})

    if (!rider) return { success: false, msg: riderMessages.FETCH_ERROR }

    const generateOtp = AlphaNumeric(4, "number")

    await RiderRepository.updateRiderDetails(
      { email },
      {
        verificationToken: generateOtp,
      },
    )

    /**send otp to email or phone number*/
    const substitutional_parameters = {
      otp: generateOtp,
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

    return { success: true, msg: riderMessages.OTP }
  }

  static async resetRiderPassword(payload: {
    email: string
    newPassword: string
    otp: string
  }) {
    const { email, newPassword, otp } = payload

    const rider = await RiderRepository.fetchRider(
      { email, verificationToken: otp },
      {},
    )

    if (!rider) return { success: false, msg: riderMessages.INCORRECT_INFO }

    const updatePassword = await RiderRepository.updateRiderDetails(
      { email },
      {
        password: await hashPassword(newPassword),
        verificationToken: "",
      },
    )
    if (!updatePassword)
      return { success: false, msg: riderMessages.INCORRECT_INFO }

    return { success: true, msg: riderMessages.PASSWORD_RESET_SUCCESS }
  }

  private static async updatePassword(password: string, id: string) {
    const hashedPassword = await hashPassword(password)

    return RiderRepository.updateRiderDetails(
      {
        _id: new mongoose.Types.ObjectId(id),
      },
      {
        $set: {
          password: hashedPassword,
        },
      },
    )
  }

  static async changeRiderPassword(
    payload: { oldPassword: string; newPassword: string },
    jwtId: any,
  ) {
    const { oldPassword, newPassword } = payload
    const rider = await RiderRepository.fetchRider(
      {
        _id: new mongoose.Types.ObjectId(jwtId),
      },
      {
        password: 1,
      },
    )

    if (!rider) return { success: false, msg: riderMessages.FETCH_ERROR }

    const passwordCheck = await verifyPassword(oldPassword, rider.password!)

    if (!passwordCheck)
      return { success: false, msg: riderMessages.INCORRECT_PASSWORD }

    const updatePassword = await this.updatePassword(newPassword, jwtId)

    if (!updatePassword)
      return { success: false, msg: riderMessages.PASSWORD_RESET_ERROR }

    return { success: true, msg: riderMessages.PASSWORD_RESET_SUCCESS }
  }
}
