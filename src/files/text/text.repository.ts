import { FilterQuery, UpdateQuery } from "mongoose"
import pagination, { IPagination } from "../../constants"
import { IText } from "./text.interface"
import Text from "./text.model"

const { LIMIT, SKIP, SORT } = pagination

export default class TextRepository {
  static async createText(textPayload: Partial<IText>): Promise<IText> {
    return Text.create(textPayload)
  }

  static async fetchText(
    textPayload: Partial<IText> | FilterQuery<Partial<IText>>,
    select: Partial<Record<keyof IText, number | Boolean | object>>,
  ): Promise<Partial<IText> | null> {
    const text: Awaited<IText | null> = await Text.find(
      {
        ...textPayload,
      },
      select,
    ).lean()

    return text
  }
}
