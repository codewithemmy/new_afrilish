import { FilterQuery, UpdateQuery } from "mongoose"
import pagination, { IPagination } from "../../constants"
import { IItem } from "./item.interface"
import Item from "./item.model"

const { LIMIT, SKIP, SORT } = pagination

export default class ItemRepository {
  static async createItem(itemPayload: Partial<IItem>): Promise<IItem> {
    return Item.create(itemPayload)
  }

  static async fetchItem(
    itemPayload: Partial<IItem> | FilterQuery<Partial<IItem>>,
    select: Partial<Record<keyof IItem, number | Boolean | object>>,
  ): Promise<Partial<IItem> | null> {
    const item: Awaited<IItem | null> = await Item.findOne(
      {
        ...itemPayload,
      },
      select,
    ).lean()

    return item
  }

  static async fetchItemByParams(itemPayload: Partial<IItem & IPagination>) {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = itemPayload

    const { search, ...extraParams } = restOfPayload

    let query = {}

    if (search) {
      query = {
        $or: [
          { guestSize: { $regex: search, $options: "i" } },
          { leastGuestSize: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      }
    }

    const item: Awaited<IItem[] | null> = await Item.find({
      ...extraParams,
      ...query,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return item
  }

  static async updateItemDetails(
    itemPayload: Partial<IItem>,
    update: UpdateQuery<Partial<IItem>>,
  ) {
    const updateItem = await Item.findOneAndUpdate(
      {
        ...itemPayload,
      },
      { ...update },
      { new: true, runValidators: true }, //returns details about the update
    )

    return updateItem
  }

  static async findAllItems(itemPayload: Partial<IItem>) {
    const item = await Item.find({
      ...itemPayload,
    })

    return item
  }
}
