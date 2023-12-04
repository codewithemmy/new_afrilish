import { IResponse } from "../../constants"
import TextRepository from "./text.repository"
import { IText } from "./text.interface"

export default class TextService {
  static async createText(textPayload: Partial<IText>): Promise<IResponse> {
    const { name, image } = textPayload

    const menu = await TextRepository.createText({ image, name })

    if (!menu) return { success: false, msg: `text repository` }

    return {
      success: true,
      msg: `successful`,
    }
  }

  static async fetchTextService(): Promise<IResponse> {
    const text: any = await TextRepository.fetchText({}, {})

    if (!text) return { success: false, msg: `unable to fetch text`, data: [] }

    return {
      success: true,
      msg: `successful`,
      data: text,
    }
  }
}
