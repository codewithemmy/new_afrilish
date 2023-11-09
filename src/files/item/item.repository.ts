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

    const item: Awaited<IItem[] | null> = await Item.find({
      ...restOfPayload,
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
}
