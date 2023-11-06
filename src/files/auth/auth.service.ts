import { IResponse } from "../../constants"
import { generalMessages } from "../../core/messages"
import {
  hashPassword,
  tokenHandler,
  verifyPassword,
  trimObjectSpaces,
} from "../../utils"
import { sendMailNotification } from "../../utils/email"
import { sendSms } from "../../utils/sms"
import redis from "../../utils/redis"
import { IAdmin, IAdminResetPasswordPayload } from "../admin/admin.interface"
import AdminService from "../admin/admin.service"
import { authMessages } from "./auth.messages"
import AdminRepository from "../admin/admin.repository"

export default class AuthService {
  static async createAdmin(rawPayload: IAdmin): Promise<IResponse> {
    const payload = trimObjectSpaces(rawPayload) as IAdmin

    const validateAdmin = await AdminRepository.validateAdmin({email:payload.email})
      if (validateAdmin) {
        return { success: true, msg: authMessages.ADMIN_EXISTS }
      }
    
    let { password } = payload
    password = await hashPassword(password)
    await AdminService.create({ ...payload, password })

    const substitutional_parameters = {
      name: payload.fullName,
      email: payload.email,
      password: payload.password
    }
    await sendMailNotification(
      payload.email,
      "Admin Account Creation",
      substitutional_parameters,
      "ADMIN_CREATION"
    )
    return { success: true, msg: authMessages.ADMIN_CREATED }
  }

  static async adminLogin(
    payload: Pick<IAdmin, "email" | "password" >
  ): Promise<IResponse> {
    const { email, password, } = payload
    const admin = await AdminService.fetchAdminWithPassword({ email })

    if (!admin) return { success: false, msg: authMessages.LOGIN_ERROR }

    const {
      _id,
      password: hashedPassword,
    } = admin

    const passwordCheck = await verifyPassword(password, hashedPassword)

    if (!passwordCheck) return { success: false, msg: authMessages.LOGIN_ERROR }

    const token = tokenHandler({ _id, email, isAdmin: true, userType: "admin"  })

    return {
      success: true,
      msg: authMessages.ADMIN_FOUND,
      data: {
        ...token,
      },
    }
  }

  static async generateOTP(data: string): Promise<string> {
    // const otp = AlphaNumeric(4, "numeric").toString()
    const otp = "1234"

    const cacheToken = await redis.setCache({
      key: `OTP:${data}`,
      value: { otp },
    }) //saving token to cache and has a 30 minutes expiry time

    return otp
  }

  static async sendPhoneOTP(
    //for both phone and email delivery
    payload: string,
    type: string = "phoneNumber",
    subject: string = "Verification"
  ): Promise<IResponse> {
    const otp = await this.generateOTP(payload!)
    let result: any
    let msg: string = `Please use ${otp} on your city express app. It will expire in 15 minutes`

    switch (type) {
      case "phoneNumber":
        // send OTP to phone number
        result = await sendSms(payload, msg)
        break
      case "email":
        // send OTP to email
        result = await sendMailNotification(
          payload,
          subject,
          { msg },
          "EMAIL_VERIFICATION"
        )
        break

      default:
        break
    }

    

    return { success: true, msg: authMessages.OTP_SENT }
  }

  static async verifyOTP(payload: {
    data: string
    otp: string
  }): Promise<IResponse> {
    const { data, otp } = payload

    const fetchToken = await redis.getCache(`OTP:${data}`)

    if (!fetchToken)
      return { success: false, msg: authMessages.OTP_VERIFICATION_FAILURE }

    const { otp: cachedOtp } = JSON.parse(fetchToken)

    if (cachedOtp !== otp)
      return { success: false, msg: authMessages.OTP_VERIFICATION_FAILURE }

    return { success: true, msg: authMessages.OTP_VERIFICATION_SUCCESS }
  }

  static async resetPassword(adminPayload: IAdminResetPasswordPayload) {
    const { email, newPassword } = adminPayload
    const updatePassword = await AdminRepository.updateAdminDetails(
      { email },
      { password: await hashPassword(newPassword) }
    )

    if (!updatePassword)
      return { success: false, msg: authMessages.PASSWORD_RESET_FAILURE }

    return { success: true, msg: authMessages.PASSWORD_RESET_SUCCESS }
  }


}