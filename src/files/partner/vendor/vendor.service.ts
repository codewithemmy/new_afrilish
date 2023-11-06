import { IResponse } from "../../../constants"
import { hashPassword, queryConstructor } from "../../../utils"
import { IVendor } from "../partner.interface"
import VendorRepository from "./vendor.repository"
import { partnerMessages } from "../partner.messages"
import mongoose from "mongoose"
import PartnerRepository from "../partner.repository"

export default class VendorService {
  static async createVendor(
    vendorPayload: Partial<IVendor>,
  ): Promise<IResponse> {
    const { phone, email, partnerId } = vendorPayload

    const verifyPartner = await PartnerRepository.fetchPartner(
      { _id: new mongoose.Types.ObjectId(partnerId) },
      {},
    )

    if (!verifyPartner)
      return { success: false, msg: partnerMessages.FETCH_ERROR }

    const validateVendor = await VendorRepository.fetchVendor(
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

    if (validateVendor)
      return { success: true, msg: partnerMessages.EXISTING_PARTNER }

    const vendor = await VendorRepository.createVendor({
      partnerId: partnerId,
      ...vendorPayload,
    })

    if (!vendor) return { success: false, msg: partnerMessages.PARTNER_FAILURE }

    await PartnerRepository.updatePartnerDetails(
      { _id: new mongoose.Types.ObjectId(verifyPartner._id) },
      {
        $push: { vendorId: vendor._id },
      },
    )

    return {
      success: true,
      msg: partnerMessages.PARTNER_SUCCESS,
      data: vendor,
    }
  }

  static async fetchVendorService(vendorPayload: Partial<IVendor>) {
    const { error, params, limit, skip, sort } = queryConstructor(
      vendorPayload,
      "createdAt",
      "Vendor",
    )

    if (error) return { success: false, msg: error }

    const vendor = await VendorRepository.fetchVendorByParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (vendor.length < 1)
      return { success: false, msg: partnerMessages.FETCH_ERROR, data: [] }

    return {
      success: true,
      msg: partnerMessages.FETCH_SUCCESS,
      data: vendor,
    }
  }

  static async updateVendor(data: {
    params: { vendorId: string }
    vendorPayload: Partial<IVendor>
  }) {
    const { params, vendorPayload } = data

    // ensure password is not updated here
    const { ...restOfPayload } = vendorPayload

    const vendor = await VendorRepository.updateVendorDetails(
      { _id: new mongoose.Types.ObjectId(params.vendorId) },
      {
        $set: {
          ...restOfPayload,
        },
      },
    )

    if (!vendor) return { success: false, msg: partnerMessages.UPDATE_ERROR }

    return { success: true, msg: partnerMessages.UPDATE_SUCCESS }
  }
}
