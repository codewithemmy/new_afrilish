import mongoose from "mongoose"
import { IResponse } from "../../constants"
import {
  AlphaNumeric,
  hashPassword,
  queryConstructor,
  tokenHandler,
  verifyPassword,
} from "../../utils"
import ItemRepository from "./item.repository"
import { itemMessages } from "./item.messages"
import { IItem } from "./item.interface"
import MenuRepository from "../menu/menu.repository"

export default class ItemService {
  static async createItem(itemPayload: Partial<IItem>): Promise<IResponse> {
    const { menuId, image } = itemPayload

    if(!image) return {success: false, msg: `image cannot be null` }

    if (!menuId) return { success: false, msg: itemMessages.EMPTY_ITEM }

    const menuExist = await MenuRepository.fetchMenu(
      {
        _id: new mongoose.Types.ObjectId(menuId),
      },
      {},
    )

    if (!menuExist) return { success: false, msg: itemMessages.NOT_FOUND }

    const item = await ItemRepository.createItem({
      vendorId: new mongoose.Types.ObjectId(menuExist.vendorId), image,
      ...itemPayload,
    })

    if (!item._id) return { success: false, msg: itemMessages.ITEM_FAILURE }

    await MenuRepository.updateMenuDetails(
      { _id: new mongoose.Types.ObjectId(menuId) },
      { $push: { item: new mongoose.Types.ObjectId(item._id) } },
    )

    return {
      success: true,
      msg: itemMessages.ITEM_SUCCESS,
      data: item,
    }
  }

  static async fetchItemService(itemPayload: Partial<IItem>) {
    const { error, params, limit, skip, sort } = queryConstructor(
      itemPayload,
      "createdAt",
      "Item",
    )

    if (error) return { success: false, msg: error }

    const item = await ItemRepository.fetchItemByParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (item.length < 1)
      return { success: false, msg: itemMessages.ITEM_FAILURE, data: [] }

    return {
      success: true,
      msg: itemMessages.FETCH_SUCCESS,
      data: item,
    }
  }

  // static async updateMenuService(menuId: any, data: Partial<IItem>) {
  //   // ensure password is not updated here
  //   const partner = await MenuRepository.updateMenuDetails(
  //     { _id: new mongoose.Types.ObjectId(menuId) },
  //     {
  //       $set: {
  //         ...data,
  //       },
  //     },
  //   )

  //   if (!partner) return { success: false, msg: itemMessages.UPDATE_ERROR }

  //   return { success: true, msg: itemMessages.UPDATE_SUCCESS }
  // }

  // static async restaurantUpdateService(data: {
  //   params: { partnerId: string }
  //   itemPayload: Partial<IItem>
  // }) {
  //   const { params, itemPayload } = data
  //   // ensure password is not updated here
  //   const { password, ...restOfPayload } = itemPayload

  //   const partner = await MenuRepository.updatePartnerDetails(
  //     { _id: new mongoose.Types.ObjectId(params.partnerId) },
  //     {
  //       $push: { restaurant: { ...restOfPayload } },
  //     },
  //   )

  //   if (!partner) return { success: false, msg: itemMessages.UPDATE_ERROR }

  //   return { success: true, msg: itemMessages.UPDATE_SUCCESS }
  // }

  // static async operationUpdateService(data: {
  //   params: { partnerId: string }
  //   itemPayload: Partial<IItem>
  // }) {
  //   const { params, itemPayload } = data
  //   // ensure password is not updated here
  //   const { password, ...restOfPayload } = itemPayload

  //   const partner = await MenuRepository.updatePartnerDetails(
  //     { _id: new mongoose.Types.ObjectId(params.partnerId) },
  //     {
  //       $push: { operations: { ...restOfPayload } },
  //     },
  //   )

  //   if (!partner) return { success: false, msg: itemMessages.UPDATE_ERROR }

  //   return { success: true, msg: itemMessages.UPDATE_SUCCESS }
  // }

  // private static async updatePassword(password: string, id: string) {
  //   const hashedPassword = await hashPassword(password)

  //   return MenuRepository.updatePartnerDetails(
  //     {
  //       _id: new mongoose.Types.ObjectId(id),
  //     },
  //     {
  //       $set: {
  //         password: hashedPassword,
  //       },
  //     },
  //   )
  // }

  // static async fetchSinglePartnerService(data: any) {
  //   const partner = await MenuRepository.fetchPartner(
  //     {
  //       _id: new mongoose.Types.ObjectId(data),
  //     },
  //     {},
  //   )

  //   if (!partner) return { success: false, msg: partnerMessages.FETCH_ERROR }

  //   return { success: true, msg: partnerMessages.FETCH_SUCCESS, partner }
  // }
}
