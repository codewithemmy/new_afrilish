import mongoose from "mongoose"
import { IPagination, IResponse } from "../../constants"
import { IAdmin, IAdminLogin } from "./admin.interface"
import AdminRepository from "./admin.repository"
import { IToken, hashPassword, tokenHandler, verifyPassword } from "../../utils"
import { adminMessages } from "./admin.messages"
import { IPartner } from "../partner/partner.interface"
import PartnerRepository from "../partner/partner.repository"

export default class AdminService {
  static async create(adminPayload: Partial<IAdmin>): Promise<IResponse> {
    const { email, password } = adminPayload
    const validate = await AdminRepository.validateAdmin({ email: email })

    if (validate) return { success: false, msg: adminMessages.EXIST }

    const hashedPassword = await hashPassword(password!)

    const admin = await AdminRepository.createAdmin({
      ...adminPayload,
      password: hashedPassword,
    })

    if (!admin) return { success: false, msg: adminMessages.CREATE_ERROR }

    return { success: true, msg: adminMessages.CREATE }
  }

  static async login(
    adminPayload: Pick<IAdmin, "email" | "password">,
  ): Promise<IResponse> {
    const { email, password } = adminPayload

    const validate = await AdminRepository.fetchAdminWithPassword({ email })

    if (!validate) return { success: false, msg: adminMessages.INVALID }

    const checkPassword = await verifyPassword(password, validate.password)

    if (!checkPassword)
      return { success: false, msg: adminMessages.PASSWORD_ERROR }

    const token = await tokenHandler({
      _id: validate._id,
      email: validate.email,
      userType: "admin",
      isAdmin: true,
    })

    return {
      success: true,
      msg: adminMessages.LOGIN,
      data: { _id: validate._id, email: validate.email, token },
    }
  }

  //to suspend partner or vendor
  static async suspendPartner(
    vendorId: any,
    payload: Partial<IPartner>,
  ): Promise<IResponse> {
    const { isSuspend } = payload

    const validateVendor = await PartnerRepository.fetchPartner(
      { vendorId: { $in: [vendorId] } },
      {},
    )

    if (!validateVendor) return { success: false, msg: `Invalid vendor Id` }

    const updatePartner = await PartnerRepository.updatePartnerDetails(
      {
        _id: new mongoose.Types.ObjectId(validateVendor._id),
      },
      { isSuspend },
    )

    if (!updatePartner)
      return {
        success: false,
        msg: "Unable to suspend partner",
      }
    return {
      success: true,
      msg: "Partner successfully suspend",
    }
  }
}
