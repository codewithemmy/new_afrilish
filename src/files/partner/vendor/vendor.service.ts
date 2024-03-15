import { IResponse } from "../../../constants"
import { hashPassword, queryConstructor, tokenHandler } from "../../../utils"
import { IVendor } from "../partner.interface"
import VendorRepository from "./vendor.repository"
import { partnerMessages } from "../partner.messages"
import mongoose, { mongo } from "mongoose"
import PartnerRepository from "../partner.repository"
import { ICoord } from "../../user/user.interface"

export default class VendorService {
  static async createVendor(
    vendorPayload: Partial<IVendor>,
  ): Promise<IResponse> {
    const { email, partnerId, vendorType } = vendorPayload

    const verifyPartner = await PartnerRepository.fetchPartner(
      { _id: new mongoose.Types.ObjectId(partnerId) },
      {},
    )

    if (!verifyPartner)
      return { success: false, msg: partnerMessages.FETCH_ERROR }

    const validateVendor = await VendorRepository.fetchVendor(
      {
        email,
        vendorType,
      },
      {
        _id: 1,
      },
    )

    if (validateVendor)
      return { success: false, msg: `vendor with email already exist` }

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

    let token = await tokenHandler({
      _id: vendor.partnerId,
      vendorId: vendor._id,
      userType: "partner",
      isPartner: true,
    })

    return {
      success: true,
      msg: partnerMessages.VENDOR_SUCCESS,
      data: { vendor, partnerToken: token },
    }
  }

  static async switchVendor(vendorPayload: string): Promise<IResponse> {
    const validateVendor = await VendorRepository.fetchVendor(
      {
        _id: new mongoose.Types.ObjectId(vendorPayload),
      },
      {
        _id: 1,
        partnerId: 1,
      },
    )

    if (!validateVendor)
      return { success: false, msg: `Unable to validate vendor Id` }

    let token = await tokenHandler({
      _id: validateVendor.partnerId,
      vendorId: validateVendor._id,
      userType: "partner",
      isPartner: true,
    })
    console.log("vendor", validateVendor._id)
    return {
      success: true,
      msg: partnerMessages.VENDOR_SUCCESS,
      data: { partnerToken: token },
    }
  }

  static async fetchVendorService(
    vendorPayload: Partial<IVendor>,
    locals: any,
  ) {
    let { error, params, limit, skip, sort } = queryConstructor(
      vendorPayload,
      "createdAt",
      "Vendor",
    )

    if (error) return { success: false, msg: error }

    params.partnerId = new mongoose.Types.ObjectId(locals._id)
    if (locals.isAdmin) delete params.partnerId

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

  static async updateVendor(
    vendorParams: any,
    vendorPayload: Partial<IVendor & ICoord>,
  ) {
    const { lng, lat, ...restOfPayload } = vendorPayload
    let locationCoord

    if (lng && lat) {
      let latChange = lat.toString()
      let lngChange = lng.toString()

      locationCoord = {
        type: "Point",
        coordinates: [parseFloat(lngChange), parseFloat(latChange)],
      }
    }

    const vendor = await VendorRepository.updateVendorDetails(
      { _id: new mongoose.Types.ObjectId(vendorParams.vendorId) },
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
    params: any
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

  static async paymentUpdateService(data: {
    params: { vendorId: string }
    vendorPayload: Partial<IVendor>
  }) {
    const { params, vendorPayload } = data

    const vendor = await VendorRepository.updateVendorDetails(
      { _id: new mongoose.Types.ObjectId(params.vendorId) },
      {
        $push: { payment: { ...vendorPayload } },
      },
    )

    if (!vendor) return { success: false, msg: partnerMessages.UPDATE_ERROR }

    return { success: true, msg: partnerMessages.UPDATE_SUCCESS }
  }

  static async getVendorPayment(params: string) {
    const vendor = await VendorRepository.fetchVendor(
      {
        _id: new mongoose.Types.ObjectId(params),
      },
      { payment: 1, _id: 0 },
    )

    if (!vendor) return { success: false, msg: partnerMessages.FETCH_ERROR }

    return {
      success: true,
      msg: partnerMessages.FETCH_SUCCESS,
      data: vendor.payment,
    }
  }

  static async deleteVendorPaymentDetails(params: string) {
    const confirmVendor = await VendorRepository.fetchVendor(
      { "payment._id": new mongoose.Types.ObjectId(params) },
      {},
    )

    if (!confirmVendor)
      return { success: false, msg: partnerMessages.VENDOR_ERROR }

    const vendor = await VendorRepository.updateVendorDetails(
      { _id: new mongoose.Types.ObjectId(confirmVendor._id) },
      { $pull: { payment: { _id: new mongoose.Types.ObjectId(params) } } },
    )

    if (!vendor) return { success: false, msg: partnerMessages.DELETE }

    return {
      success: true,
      msg: partnerMessages.PARTNER_DELETE,
    }
  }

  static async rateVendorService(
    params: { rate: number; review: string; ratedBy: any },
    id: string,
  ) {
    const { rate } = params
    if (rate > 5)
      return {
        success: false,
        msg: `any number above 5 is invalid rating number`,
      }
    const confirmVendor = await VendorRepository.fetchVendor(
      { _id: new mongoose.Types.ObjectId(id) },
      {},
    )

    if (!confirmVendor)
      return { success: false, msg: partnerMessages.VENDOR_ERROR }

    const vendor = await VendorRepository.updateVendorDetails(
      { _id: new mongoose.Types.ObjectId(confirmVendor._id) },
      { $push: { rating: { ...params } } },
    )

    if (!vendor) return { success: false, msg: `Unable to rate vendor` }

    return {
      success: true,
      msg: `Vendor rated successfully`,
    }
  }

  static async getVendorAnalysis() {
    const [
      restaurantVendor,
      bulkFoodVendor,
      eventPlannerVendor,
      privateVendor,
    ] = await Promise.all([
      await VendorRepository.fetchVendorWithoutParams({
        vendorType: "restaurantVendor",
      }),
      await VendorRepository.fetchVendorWithoutParams({
        vendorType: "bulkFoodVendor",
      }),
      await VendorRepository.fetchVendorWithoutParams({
        vendorType: "eventPlannerVendor",
      }),
      await VendorRepository.fetchVendorWithoutParams({
        vendorType: "privateVendor",
      }),
    ])

    return {
      success: true,
      msg: partnerMessages.FETCH_SUCCESS,
      data: {
        restaurantVendor,
        bulkFoodVendor,
        eventPlannerVendor,
        privateVendor,
      },
    }
  }
}
