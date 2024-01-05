import { IResponse } from "../../../constants"
import { hashPassword, queryConstructor } from "../../../utils"
import { IVendor } from "../partner.interface"
import VendorRepository from "./vendor.repository"
import { partnerMessages } from "../partner.messages"
import mongoose from "mongoose"
import PartnerRepository from "../partner.repository"
import { ICoord } from "../../user/user.interface"

export default class VendorService {
  static async createVendor(
    vendorPayload: Partial<IVendor>,
  ): Promise<IResponse> {
    const { phone, email, partnerId } = vendorPayload

    console.log("vendorPayload", vendorPayload)

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
      return { success: false, msg: partnerMessages.VENDOR_DETAILS }

    const vendor = await VendorRepository.createVendor({
      partnerId: partnerId,
      ...vendorPayload,
      updated: true,
    })

    if (!vendor) return { success: false, msg: partnerMessages.VENDOR_FAILURE }

    await PartnerRepository.updatePartnerDetails(
      { _id: new mongoose.Types.ObjectId(verifyPartner._id) },
      {
        $push: { vendorId: vendor._id },
      },
    )

    return {
      success: true,
      msg: partnerMessages.VENDOR_SUCCESS,
      data: vendor,
    }
  }

  static async fetchVendorService(vendorPayload: Partial<IVendor>, jwtId: any) {
    let { error, params, limit, skip, sort } = queryConstructor(
      vendorPayload,
      "createdAt",
      "Vendor",
    )

    if (error) return { success: false, msg: error }

    params.partnerId = new mongoose.Types.ObjectId(jwtId)

    const vendor = await VendorRepository.fetchVendorByParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (vendor.length < 1)
      return { success: false, msg: partnerMessages.VENDOR_ERROR, data: [] }

    return {
      success: true,
      msg: partnerMessages.FETCH_SUCCESS,
      data: vendor,
    }
  }

  static async updateVendor(data: {
    params: { vendorId: string }
    vendorPayload: Partial<IVendor & ICoord>
  }) {
    const { params, vendorPayload } = data

    const { lng, lat, ...restOfPayload } = vendorPayload
    let locationCoord

    if (lng && lat) {
      let latChange = lat.toString()
      let lngChange = lng.toString()

      locationCoord = {
        type: "Point",
        coordinates: [parseFloat(latChange), parseFloat(lngChange)],
      }
    }

    const vendor = await VendorRepository.updateVendorDetails(
      { _id: new mongoose.Types.ObjectId(params.vendorId) },
      {
        $set: {
          ...restOfPayload,
          locationCoord,
        },
      },
    )

    if (!vendor) return { success: false, msg: partnerMessages.UPDATE_ERROR }

    return { success: true, msg: partnerMessages.UPDATE_SUCCESS }
  }

  static async operationUpdateService(data: {
    params: { vendorId: string }
    vendorPayload: Partial<IVendor>
  }) {
    const { params, vendorPayload } = data

    const { ...restOfPayload } = vendorPayload

    const vendor = await VendorRepository.updateVendorDetails(
      { _id: new mongoose.Types.ObjectId(params.vendorId) },
      {
        $set: { vendorOperations: { ...restOfPayload, updated: true } },
      },
    )

    if (!vendor) return { success: false, msg: partnerMessages.UPDATE_ERROR }

    return { success: true, msg: partnerMessages.UPDATE_SUCCESS }
  }
}
