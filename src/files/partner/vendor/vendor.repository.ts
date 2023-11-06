import { FilterQuery, UpdateQuery } from "mongoose"
import pagination, { IPagination } from "../../../constants"
import { IVendor, IPartner } from "../partner.interface"
import Vendor from "./vendor.model"

const { LIMIT, SKIP, SORT } = pagination

export default class VendorRepository {
  static async createVendor(
    vendorPayload: Partial<IVendor>,
  ): Promise<IVendor> {
    return Vendor.create(vendorPayload)
  }

  static async fetchVendor(
    vendorPayload: Partial<IVendor> | FilterQuery<Partial<IVendor>>,
    select: Partial<Record<keyof IVendor, number | Boolean | object>>,
  ): Promise<Partial<IVendor> | null> {
    const vendor: Awaited<IVendor | null> = await Vendor.findOne(
      {
        ...vendorPayload,
      },
      select,
    ).lean()

    return vendor
  }

  static async fetchVendorByParams(
    vendorPayload: Partial<IVendor & IPagination>,
  ) {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = vendorPayload

    const vendor: Awaited<IVendor[] | null> = await Vendor.find({
      ...restOfPayload,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return vendor
  }

  static async updateVendorDetails(
    vendorPayload: Partial<IPartner>,
    update: UpdateQuery<Partial<IVendor>>,
  ) {
    const updateVendor = await Vendor.findOneAndUpdate(
      {
        ...vendorPayload,
      },
      { ...update },
      { new: true, runValidators: true }, //returns details about the update
    )

    return updateVendor
  }
}
