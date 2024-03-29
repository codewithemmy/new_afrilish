import { NextFunction, Response, Request, query } from "express"
import { responseHandler } from "../../core/response"
import { fileModifier, manageAsyncOps } from "../../utils"
import { CustomError } from "../../utils/error"
import { statusCode } from "../../constants/statusCode"
import MenuService from "./menu.service"

class MenuController {
  async createMenuController(req: Request, res: Response, next: NextFunction) {
    const { image, body } = fileModifier(req)
    const [error, data] = await manageAsyncOps(
      MenuService.createMenu(
        {
          image,
          ...body,
        },
        res.locals.jwt,
      ),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async fetchMenuController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      MenuService.fetchMenuService(req.query, res.locals.jwt),
    )
    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async updateMenuController(req: Request, res: Response, next: NextFunction) {
    const { image, body } = fileModifier(req)
    const [error, data] = await manageAsyncOps(
      MenuService.updateMenuService(req.params.menuId, { image, ...body }),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async deleteMenuController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      MenuService.deleteMenuService(req.params.menuId as string),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }
}

export default new MenuController()
