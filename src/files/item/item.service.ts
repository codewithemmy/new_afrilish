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
  static async createItem(itemPayload: IItem): Promise<IResponse> {
    const { menuId } = itemPayload
    if (!menuId) return { success: false, msg: itemMessages.EMPTY_ITEM }

    const menuExist = await MenuRepository.fetchMenu(
      {
        _id: new mongoose.Types.ObjectId(menuId),
      },
      {},
    )

    if (!menuExist) return { success: false, msg: itemMessages.NOT_FOUND }

    const item = await ItemRepository.createItem(itemPayload)

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

  // static async fetchMenuService(itemPayload: Partial<IItem>) {
  //   const { error, params, limit, skip, sort } = queryConstructor(
  //     itemPayload,
  //     "createdAt",
  //     "Menu",
  //   )

  //   if (error) return { success: false, msg: error }

  //   const menu = await MenuRepository.fetchMenuByParams({
  //     ...params,
  //     limit,
  //     skip,
  //     sort,
  //   })

  //   if (menu.length < 1)
  //     return { success: false, msg: itemMessages.MENU_FAILURE, data: [] }

  //   return {
  //     success: true,
  //     msg: itemMessages.FETCH_SUCCESS,i
  //     data: menu,
  //   }
  // }

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

  // static async resetPassword(data: {
  //   params: { partnerId: string }
  //   payload: { oldPassword: string; newPassword: string }
  // }) {
  //   const { params, payload } = data

  //   const partner = await MenuRepository.fetchPartner(
  //     {
  //       _id: new mongoose.Types.ObjectId(params.partnerId),
  //     },
  //     {
  //       password: 1,
  //     },
  //   )

  //   if (!partner) return { success: false, msg: itemMessages.FETCH_ERROR }

  //   const passwordCheck = await verifyPassword(
  //     payload.oldPassword,
  //     partner.password!,
  //   )

  //   if (!passwordCheck)
  //     return { success: false, msg: itemMessages.INCORRECT_PASSWORD }

  //   const updatePassword = await this.updatePassword(
  //     payload.newPassword,
  //     params.partnerId,
  //   )

  //   if (!updatePassword)
  //     return { success: false, msg: partnerMessages.PASSWORD_RESET_ERROR }

  //   return { success: true, msg: partnerMessages.PASSWORD_RESET_SUCCESS }
  // }

  // static async deletePartnerService(data: { params: { partnerId: string } }) {
  //   const { params } = data

  //   const partner = await MenuRepository.updatePartnerDetails(
  //     { _id: new mongoose.Types.ObjectId(params.partnerId) },
  //     {
  //       $set: {
  //         isDelete: true,
  //       },
  //     },
  //   )

  //   if (!partner) return { success: false, msg: partnerMessages.DELETE_FAILURE }

  //   return { success: true, msg: partnerMessages.PARTNER_DELETE }
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
