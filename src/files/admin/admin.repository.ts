import { UpdateQuery } from "mongoose"
import pagination, { IPagination } from "../../constants"
import { IAdmin, IAdminLogin } from "./admin.interface"
import Admin from "./admin.model"
const { LIMIT, SKIP, SORT } = pagination

export default class AdminRepository {
  static createAdmin(adminPayload: Partial<IAdmin>): Promise<IAdmin> {
    return Admin.create(adminPayload)
  }

  static async fetchAdminWithPassword(
    adminPayload: Partial<IAdmin>,
  ): Promise<IAdminLogin | null> {
    const admin: Awaited<IAdmin | null> = await Admin.findOne(
      {
        ...adminPayload,
      },
      { _id: 1, password: 1, email: 1 },
    )
    return admin
  }

  static async validateAdmin(adminPayload: Partial<IAdmin>) {
    const admin = await Admin.exists({
      ...adminPayload,
    })
    return admin
  }

  static async updateAdminDetails(
    userPayload: Partial<IAdmin>,
    update: UpdateQuery<Partial<IAdmin>>,
  ): Promise<{ updatedExisting?: boolean | undefined }> {
    const { lastErrorObject: response } = await Admin.findOneAndUpdate(
      {
        ...userPayload,
      },
      { ...update },
      { includeResultMetadata: true },
    )

    return response!
  }

  static async deleteAdminProfile(
    _id: Partial<IAdmin>,
  ): Promise<IAdmin | null> {
    const adminDetails = await Admin.findOneAndDelete({
      _id,
    })

    return adminDetails
  }

  static async fetchAdminsByParams(
    adminPayload: Partial<IAdmin>,
    pagination: IPagination,
  ): Promise<Omit<IAdmin, "password">[] | null> {
    const { limit = LIMIT, skip = SKIP, sort = SORT } = pagination
    const admin: Awaited<Omit<IAdmin, "password">[] | null> = await Admin.find({
      ...adminPayload,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-password")
    return admin
  }
}
