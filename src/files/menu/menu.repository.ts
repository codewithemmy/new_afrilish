import { FilterQuery, UpdateQuery } from "mongoose"
import pagination, { IPagination } from "../../constants"
import { IMenu } from "./menu.interface"
import Menu from "./menu.model"

const { LIMIT, SKIP, SORT } = pagination

export default class MenuRepository {
  static async createMenu(menuPayload: Partial<IMenu>): Promise<IMenu> {
    return Menu.create(menuPayload)
  }

  static async fetchMenu(
    menuPayload: Partial<IMenu> | FilterQuery<Partial<IMenu>>,
    select: Partial<Record<keyof IMenu, number | Boolean | object>>,
  ): Promise<Partial<IMenu> | null> {
    const menu: Awaited<IMenu | null> = await Menu.findOne(
      {
        ...menuPayload,
      },
      select,
    ).lean()

    return menu
  }

  static async fetchMenuByParams(menuPayload: Partial<IMenu & IPagination>) {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = menuPayload

    const menu: Awaited<IMenu[] | null> = await Menu.find({
      ...restOfPayload,
    })
      .populate({ path: "item" })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return menu
  }

  static async updateMenuDetails(
    menuPayload: Partial<IMenu>,
    update: UpdateQuery<Partial<IMenu>>,
  ) {
    const updateMenu = await Menu.findOneAndUpdate(
      {
        ...menuPayload,
      },
      { ...update },
      { new: true, runValidators: true }, //returns details about the update
    )

    return updateMenu
  }

  static async deleteMenuDetails(menuPayload: Partial<IMenu>) {
    const menu = await Menu.findByIdAndDelete({
      ...menuPayload,
    })

    return menu
  }
}
