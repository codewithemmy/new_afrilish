import mongoose, { mongo } from "mongoose"
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
    const { menuId, image, partnerId } = itemPayload

    if (!image) return { success: false, msg: `image cannot be null` }

    if (!menuId) return { success: false, msg: itemMessages.EMPTY_ITEM }

    const menuExist = await MenuRepository.fetchMenu(
      {
        _id: new mongoose.Types.ObjectId(menuId),
      },
      {},
    )

    if (!menuExist) return { success: false, msg: itemMessages.NOT_FOUND }

    const item = await ItemRepository.createItem({
      vendorId: new mongoose.Types.ObjectId(menuExist.vendorId),
      partnerId: new mongoose.Types.ObjectId(partnerId),
      image,
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

  static async fetchItemService(itemPayload: Partial<IItem>, payload: any) {
    const { error, params, limit, skip, sort } = queryConstructor(
      itemPayload,
      "createdAt",
      "Item",
    )

    if (error) return { success: false, msg: error }

    let extra = { partnerId: new mongoose.Types.ObjectId(payload) }

    const item = await ItemRepository.fetchItemByParams({
      ...params,
      limit,
      skip,
      sort,
      ...extra,
    })

    if (item.length < 1)
      return { success: false, msg: itemMessages.ITEM_FAILURE, data: [] }

    return {
      success: true,
      msg: itemMessages.FETCH_SUCCESS,
      data: item,
    }
  }

  static async updateItemService(itemId: any, data: Partial<IItem>) {
    // ensure password is not updated here
    const item = await ItemRepository.updateItemDetails(
      { _id: new mongoose.Types.ObjectId(itemId) },
      {
        $set: {
          ...data,
        },
      },
    )

    if (!item) return { success: false, msg: itemMessages.UPDATE_ERROR }

    return { success: true, msg: itemMessages.UPDATE_SUCCESS }
  }
}
