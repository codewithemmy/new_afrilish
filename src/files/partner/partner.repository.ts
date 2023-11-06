import { FilterQuery, UpdateQuery } from "mongoose"
import pagination, { IPagination } from "../../constants"
import { IPartner } from "./partner.interface"
import Partner from "./partner.model"

const { LIMIT, SKIP, SORT } = pagination

export default class PartnerRepository {
  static async createPartner(partnerPayload: IPartner): Promise<IPartner> {
    return Partner.create(partnerPayload)
  }

  static async fetchPartner(
    partnerPayload: Partial<IPartner> | FilterQuery<Partial<IPartner>>,
    select: Partial<Record<keyof IPartner, number | Boolean | object>>,
  ): Promise<Partial<IPartner> | null> {
    const partner: Awaited<IPartner | null> = await Partner.findOne(
      {
        ...partnerPayload,
      },                                      
      select,
    ).lean()

    return partner
  }

  static async fetchPartnerByParams(
    partnerPayload: Partial<IPartner & IPagination>,
  ) {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = partnerPayload

    const partner: Awaited<IPartner[] | null> = await Partner.find({
      ...restOfPayload,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return partner
  }

  static async updatePartnerDetails(
    partnerPayload: Partial<IPartner>,
    update: UpdateQuery<Partial<IPartner>>,
  ) {
    const updatePartner = await Partner.findOneAndUpdate(
      {
        ...partnerPayload,
      },
      { ...update },
      { new: true, runValidators: true }, //returns details about the update
    )

    return updatePartner
  }
}
