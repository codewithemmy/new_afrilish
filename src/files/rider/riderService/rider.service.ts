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
    name: string
    password: string
  }): Promise<IResponse> {
    const { password, phone, email, name } = riderPayload

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

    const otp = AlphaNumeric(4)

    const rider = await RiderRepository.createRider({
      ...riderPayload,
      verificationToken: otp,
      password: await hashPassword(password),
    })

    if (!rider) return { success: false, msg: riderMessages.RIDER_FAILURE }

    const substitutional_parameters = {
      name: name,
      email: email,
      otp: otp,
      imageUrl:
        "https://res.cloudinary.com/dn6eonkzc/image/upload/v1684420375/DEV/vlasbjyf9antscatbgzt.webp",
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

  static async resentOtpService(riderPayload: any): Promise<IResponse> {
    // check if rider exists using phone or email
    const validateRider = await RiderRepository.fetchRider(
      { _id: new mongoose.Types.ObjectId(riderPayload) },
      {
        _id: 1,
      },
    )

    if (!validateRider) return { success: true, msg: riderMessages.FETCH_ERROR }

    const otp = AlphaNumeric(4)

    const email: any = validateRider.email
    const name: any = validateRider.name

    const updateRider = await RiderRepository.updateRiderDetails(
      { email },
      { verificationToken: otp },
    )

    if (!updateRider) return { success: true, msg: `unable to send otp` }

    const substitutional_parameters = {
      name: name,
      email: email,
      otp: otp,
      imageUrl:
        "https://res.cloudinary.com/dn6eonkzc/image/upload/v1684420375/DEV/vlasbjyf9antscatbgzt.webp",
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

    return {
      success: true,
      msg: riderMessages.OTP,
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

    const name: any = confirmOtp.name

    const substitutional_parameters = {
      name: name,
      email: email,
      imageUrl:
        "https://res.cloudinary.com/dn6eonkzc/image/upload/v1684420375/DEV/vlasbjyf9antscatbgzt.webp",
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

    const generateOtp = AlphaNumeric(4)

    //set otp timeout to 60 ten minutes
    const tenMinutes = 1000 * 60 * 10
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes)

    await RiderRepository.updateRiderDetails(
      { email },
      {
        passwordToken: generateOtp,
        passwordTokenExpirationDate: passwordTokenExpirationDate,
      },
    )

    /**send otp to email or phone number*/
    const substitutional_parameters = {
      resetOtp: generateOtp,
      imageUrl:
        "https://res.cloudinary.com/dn6eonkzc/image/upload/v1684420375/DEV/vlasbjyf9antscatbgzt.webp",
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
      { email, passwordToken: otp },
      { passwordTokenExpirationDate: 1 },
    )

    if (!rider) return { success: false, msg: riderMessages.FETCH_ERROR }

    const currentDate: any = new Date().toISOString

    if (
      rider.passwordTokenExpirationDate &&
      rider.passwordTokenExpirationDate > currentDate
    )
      return { success: false, msg: riderMessages.FETCH_ERROR }

    const updatePassword = await RiderRepository.updateRiderDetails(
      { email },
      {
        password: await hashPassword(newPassword),
        passwordToken: "",
        passwordTokenExpirationDate: "",
      },
    )
    if (!updatePassword)
      return { success: false, msg: riderMessages.UPDATE_ERROR }

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
