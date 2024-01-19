import mongoose from "mongoose"
import { IResponse } from "../../constants"
import { queryConstructor } from "../../utils"
import MenuRepository from "./menu.repository"
import { menuMessages } from "./menu.messages"
import { IMenu } from "./menu.interface"
import PartnerRepository from "../partner/partner.repository"
import ItemRepository from "../item/item.repository"

export default class MenuService {
  static async createMenu(menuPayload: Partial<IMenu>): Promise<IResponse> {
    const { title, vendorId } = menuPayload

    if (!vendorId) return { success: false, msg: menuMessages.EMPTY_VENDOR }

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

  static async deleteMenuService(menuId: string) {
    const menuExist = await MenuRepository.fetchMenu(
      {
        _id: new mongoose.Types.ObjectId(menuId),
      },
      {},
    )

    if (!menuExist) return { success: false, msg: menuMessages.INVALID_ID }

    const menuItem: any = menuExist.item

    // Delete each associated item by ID
    for (const itemId of menuItem) {
      await ItemRepository.deleteItemDetails({
        _id: new mongoose.Types.ObjectId(itemId),
      })
    }

    const menu = await MenuRepository.deleteMenuDetails({
      _id: new mongoose.Types.ObjectId(menuId),
    })

    if (!menu) return { success: false, msg: menuMessages.DELETE_FAILURE }

    return { success: true, msg: menuMessages.MENU_DELETE }
  }
}
