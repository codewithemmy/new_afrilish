import { NextFunction, Response, Request, query } from "express"
import { responseHandler } from "../../core/response"
import { fileModifier, manageAsyncOps } from "../../utils"
import { CustomError } from "../../utils/error"
import { statusCode } from "../../constants/statusCode"
import ItemService from "./item.service"

class ItemController {
  async createItemController(req: Request, res: Response, next: NextFunction) {
    const { image, body } = fileModifier(req)
    console.log("body", body)
    const [error, data] = await manageAsyncOps(
      ItemService.createItem({
        image,
        partnerId: res.locals.jwt._id,
        ...body,
      }),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async fetchItemController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      ItemService.fetchItemService(req.query, res.locals.jwt),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async updateItemController(req: Request, res: Response, next: NextFunction) {
    const { image, body } = fileModifier(req)
    const [error, data] = await manageAsyncOps(
      ItemService.updateItemService(req.params.itemId, { image, ...body }),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }
}

export default new ItemController()
