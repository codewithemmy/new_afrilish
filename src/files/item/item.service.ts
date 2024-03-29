import mongoose, { mongo } from "mongoose"
import { IResponse } from "../../constants"
import { queryConstructor } from "../../utils"
import ItemRepository from "./item.repository"
import { itemMessages } from "./item.messages"
import { IItem } from "./item.interface"
import MenuRepository from "../menu/menu.repository"
import VendorRepository from "../partner/vendor/vendor.repository"

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

    await Promise.all([
      await MenuRepository.updateMenuDetails(
        { _id: new mongoose.Types.ObjectId(menuId) },
        { $push: { item: new mongoose.Types.ObjectId(item._id) } },
      ),
      await VendorRepository.updateVendorDetails(
        { _id: new mongoose.Types.ObjectId(menuExist.vendorId) },
        { $push: { itemId: new mongoose.Types.ObjectId(item._id) } },
      ),
    ])

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

    let extra

    if (error) return { success: false, msg: error }

    extra = { partnerId: new mongoose.Types.ObjectId(payload?._id) }

    if (!payload?.isPartner) extra = {}

    const item = await ItemRepository.fetchItemByParams({
      ...params,
      limit,
      skip,
      sort,
      ...extra,
    })

    if (item.length < 1)
      return { success: true, msg: itemMessages.ITEM_FAILURE, data: [] }

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

  static async deleteItemService(itemId: string) {
    const itemExist = await ItemRepository.fetchItem(
      {
        _id: new mongoose.Types.ObjectId(itemId),
      },
      {},
    )

    if (!itemExist) return { success: false, msg: itemMessages.INVALID_ID }

    await Promise.all([
      await MenuRepository.updateMenuDetails(
        { item: { $in: [new mongoose.Types.ObjectId(itemId)] } },
        { $pull: { item: new mongoose.Types.ObjectId(itemId) } },
      ),
      await ItemRepository.deleteItemDetails({
        _id: new mongoose.Types.ObjectId(itemId),
      }),
    ])

    return { success: true, msg: itemMessages.ITEM_DELETE }
  }
}
