import mongoose from "mongoose"
import { IResponse } from "../../constants"
import {
  AlphaNumeric,
  hashPassword,
  queryConstructor,
  tokenHandler,
  verifyPassword,
} from "../../utils"
import { IPartner } from "./partner.interface"
import PartnerRepository from "./partner.repository"
import { partnerMessages } from "./partner.messages"
import { sendMailNotification } from "../../utils/email"
import { generalMessages } from "../../core/messages"

export default class PartnerService {
  static async createPartner(partnerPayload: IPartner): Promise<IResponse> {
    let { password, phone, email, fullName } = partnerPayload

    // check if partner exists using phone or email
    const validatePartner = await PartnerRepository.fetchPartner(
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

    if (validatePartner)
      return { success: false, msg: partnerMessages.EXISTING_PARTNER }

    const otp = AlphaNumeric(4)

    const partner = await PartnerRepository.createPartner({
      ...partnerPayload,
      verificationOtp: otp,
      password: await hashPassword(password),
    })

    if (!partner)
      return { success: false, msg: partnerMessages.PARTNER_FAILURE }

    // send mail login details to partner
    try {
      await sendMailNotification(
        email,
        "Registration",
        {
          fullName,
          email,
          otp,
          imageUrl:
            "https://res.cloudinary.com/dn6eonkzc/image/upload/v1684420375/DEV/vlasbjyf9antscatbgzt.webp",
        },
        "REGISTRATION",
      )
    } catch (error) {
      console.log("error", error)
    }

    partner.password = ""

    const partnerToken = await tokenHandler({ _id: partner._id })

    return {
      success: true,
      msg: partnerMessages.PARTNER_SUCCESS,
      data: { partnerToken },
    }
  }

  static async loginPartner(
    partnerPayload: Pick<IPartner, "email" | "password">,
  ) {
    const { email, password } = partnerPayload

    const partner = await PartnerRepository.fetchPartner({ email }, {})

    if (!partner)
      return { success: false, msg: generalMessages.INCORRECT_DETAILS }

    if (!partner.isVerified)
      return { success: false, msg: generalMessages.NOT_VERIFIED }

    const validatePassword = await verifyPassword(password!, partner.password!)
    if (!validatePassword)
      return { success: false, msg: generalMessages.INCORRECT_DETAILS }

    partner.password = undefined

    const token = tokenHandler({ ...partner, userType: "partner" })

    return {
      success: true,
      msg: generalMessages.SUCCESSFUL_LOGIN,
      data: { ...partner, token },
    }
  }

  static async fetchPartnerService(partnerPayload: Partial<IPartner>) {
    const { error, params, limit, skip, sort } = queryConstructor(
      partnerPayload,
      "createdAt",
      "Partner",
    )

    if (error) return { success: false, msg: error }

    const partner = await PartnerRepository.fetchPartnerByParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (partner.length < 1)
      return { success: false, msg: partnerMessages.PARTNER_FAILURE, data: [] }

    return {
      success: true,
      msg: partnerMessages.FETCH_SUCCESS,
      data: partner,
    }
  }

  static async updatePartner(data: {
    params: { partnerId: string }
    partnerPayload: Partial<IPartner>
  }) {
    const { params, partnerPayload } = data
    // ensure password is not updated here
    const { password, ...restOfPayload } = partnerPayload

    const partner = await PartnerRepository.updatePartnerDetails(
      { _id: new mongoose.Types.ObjectId(params.partnerId) },
      {
        $set: {
          ...restOfPayload,
        },
      },
    )

    if (!partner) return { success: false, msg: partnerMessages.UPDATE_ERROR }

    return { success: true, msg: partnerMessages.UPDATE_SUCCESS }
  }

  private static async updatePassword(password: string, id: string) {
    const hashedPassword = await hashPassword(password)

    return PartnerRepository.updatePartnerDetails(
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

  static async resetPassword(data: {
    params: { partnerId: string }
    payload: { oldPassword: string; newPassword: string }
  }) {
    const { params, payload } = data

    const partner = await PartnerRepository.fetchPartner(
      {
        _id: new mongoose.Types.ObjectId(params.partnerId),
      },
      {
        password: 1,
      },
    )

    if (!partner) return { success: false, msg: partnerMessages.FETCH_ERROR }

    const passwordCheck = await verifyPassword(
      payload.oldPassword,
      partner.password!,
    )

    if (!passwordCheck)
      return { success: false, msg: partnerMessages.INCORRECT_PASSWORD }

    const updatePassword = await this.updatePassword(
      payload.newPassword,
      params.partnerId,
    )

    if (!updatePassword)
      return { success: false, msg: partnerMessages.PASSWORD_RESET_ERROR }

    return { success: true, msg: partnerMessages.PASSWORD_RESET_SUCCESS }
  }

  static async deletePartnerService(data: { params: { partnerId: string } }) {
    const { params } = data

    const partner = await PartnerRepository.updatePartnerDetails(
      { _id: new mongoose.Types.ObjectId(params.partnerId) },
      {
        $set: {
          isDelete: true,
        },
      },
    )

    if (!partner) return { success: false, msg: partnerMessages.DELETE_FAILURE }

    return { success: true, msg: partnerMessages.PARTNER_DELETE }
  }

  static async fetchSinglePartnerService(data: any) {
    const partner = await PartnerRepository.fetchPartner(
      {
        _id: new mongoose.Types.ObjectId(data),
      },
      {},
    )

    if (!partner)
      return { success: false, msg: partnerMessages.PARTNER_FAILURE }

    return {
      success: true,
      msg: partnerMessages.PARTNER_SUCCESS,
      data: partner,
    }
  }

  static async verifyPartnerService(payload: { otp: string; email: string }) {
    const { otp, email } = payload

    const confirmOtp = await PartnerRepository.fetchPartner(
      { verificationOtp: otp, email },
      {},
    )

    if (!confirmOtp)
      return { success: false, msg: partnerMessages.INCORRECT_INFO }

    await PartnerRepository.updatePartnerDetails(
      { _id: new mongoose.Types.ObjectId(confirmOtp._id) },
      { verificationOtp: "", isVerified: true },
    )

    return {
      success: true,
      msg: partnerMessages.VERIFIED,
    }
  }

  static async forgotPasswordService(payload: { email: string }) {
    const { email } = payload
    const partner = await PartnerRepository.fetchPartner({ email: email }, {})

    if (!partner) return { success: false, msg: partnerMessages.FETCH_ERROR }

    const generateOtp = AlphaNumeric(4)

    await PartnerRepository.updatePartnerDetails(
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

    return { success: true, msg: partnerMessages.OTP, generateOtp }
  }

  static async resetPasswordService(partnerPayload: {
    otp: string
    newPassword: string
    email: string
  }) {
    const { newPassword, email, otp } = partnerPayload

    const findPartner = await PartnerRepository.fetchPartner(
      {
        email,
        verificationOtp: otp,
      },
      {},
    )

    if (!findPartner)
      return { success: false, msg: partnerMessages.FETCH_ERROR }

    const updatePartner = await PartnerRepository.updatePartnerDetails(
      { email },
      { password: await hashPassword(newPassword), verificationOtp: "" },
    )

    if (!updatePartner)
      return { success: false, msg: partnerMessages.UPDATE_ERROR }

    return { success: true, msg: partnerMessages.UPDATE_SUCCESS }
  }
}
