import mongoose from "mongoose"
import { IResponse } from "../../constants"
import {
  AlphaNumeric,
  hashPassword,
  queryConstructor,
  tokenHandler,
  verifyPassword,
} from "../../utils"
import MenuRepository from "./subscription.repository"
import { menuMessages } from "./subscription.messages"
import { sendMailNotification } from "../../utils/email"
import { generalMessages } from "../../core/messages"
import { IMenu } from "./subscription.interface"

export default class MenuService {
  static async createMenu(menuPayload: Partial<IMenu>): Promise<IResponse> {
    const { title, vendorId } = menuPayload

    if (!vendorId) return { success: false, msg: menuMessages.EMPTY_RESTAURANT }

    const menuExist = await MenuRepository.fetchMenu(
      { title, vendorId: new mongoose.Types.ObjectId(vendorId) },
      {},
    )

    if (menuExist) return { success: false, msg: menuMessages.EXISTING_MENU }

    const menu = await MenuRepository.createMenu(menuPayload)

    if (!menu) return { success: false, msg: menuMessages.MENU_FAILURE }

    return {
      success: true,
      msg: menuMessages.MENU_SUCCESS,
      data: menu,
    }
  }

  static async fetchMenuService(menuPayload: Partial<IMenu>) {
    const { error, params, limit, skip, sort } = queryConstructor(
      menuPayload,
      "createdAt",
      "Menu",
    )

    if (error) return { success: false, msg: error }

    const menu = await MenuRepository.fetchMenuByParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (menu.length < 1)
      return { success: false, msg: menuMessages.NOT_FOUND, data: [] }

    return {
      success: true,
      msg: menuMessages.FETCH_SUCCESS,
      data: menu,
    }
  }

  static async updateMenuService(menuId: any, data: Partial<IMenu>) {
    // ensure password is not updated here
    const partner = await MenuRepository.updateMenuDetails(
      { _id: new mongoose.Types.ObjectId(menuId) },
      {
        $set: {
          ...data,
        },
      },
    )

    if (!partner) return { success: false, msg: menuMessages.UPDATE_ERROR }

    return { success: true, msg: menuMessages.UPDATE_SUCCESS }
  }

  // static async restaurantUpdateService(data: {
  //   params: { partnerId: string }
  //   menuPayload: Partial<IMenu>
  // }) {
  //   const { params, menuPayload } = data
  //   // ensure password is not updated here
  //   const { password, ...restOfPayload } = menuPayload

  //   const partner = await MenuRepository.updatePartnerDetails(
  //     { _id: new mongoose.Types.ObjectId(params.partnerId) },
  //     {
  //       $push: { restaurant: { ...restOfPayload } },
  //     },
  //   )

  //   if (!partner) return { success: false, msg: menuMessages.UPDATE_ERROR }

  //   return { success: true, msg: menuMessages.UPDATE_SUCCESS }
  // }

  // static async operationUpdateService(data: {
  //   params: { partnerId: string }
  //   menuPayload: Partial<IMenu>
  // }) {
  //   const { params, menuPayload } = data
  //   // ensure password is not updated here
  //   const { password, ...restOfPayload } = menuPayload

  //   const partner = await MenuRepository.updatePartnerDetails(
  //     { _id: new mongoose.Types.ObjectId(params.partnerId) },
  //     {
  //       $push: { operations: { ...restOfPayload } },
  //     },
  //   )

  //   if (!partner) return { success: false, msg: menuMessages.UPDATE_ERROR }

  //   return { success: true, msg: menuMessages.UPDATE_SUCCESS }
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

  //   if (!partner) return { success: false, msg: menuMessages.FETCH_ERROR }

  //   const passwordCheck = await verifyPassword(
  //     payload.oldPassword,
  //     partner.password!,
  //   )

  //   if (!passwordCheck)
  //     return { success: false, msg: menuMessages.INCORRECT_PASSWORD }

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
