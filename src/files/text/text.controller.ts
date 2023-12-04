import { NextFunction, Response, Request, query } from "express"
import { responseHandler } from "../../core/response"
import { fileModifier, manageAsyncOps } from "../../utils"
import { CustomError } from "../../utils/error"
import { statusCode } from "../../constants/statusCode"
import TextService from "./text.service"

class TextController {
  async createTextController(req: Request, res: Response, next: NextFunction) {
    const { image, body } = fileModifier(req)
    const [error, data] = await manageAsyncOps(
      TextService.createText({
        image,
        ...body,
      }),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async getTextController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      TextService.fetchTextService(),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }
}

export default new TextController()
