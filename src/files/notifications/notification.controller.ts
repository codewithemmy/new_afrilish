import { NextFunction, Response, Request } from "express"
import { responseHandler } from "../../core/response"
import { manageAsyncOps } from "../../utils"
import { CustomError } from "../../utils/error"
import NotificationService from "./notification.service"

class NotificationController {
  async createNotification(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      NotificationService.create(req.body, res.locals.jwt),
    )

    if (error) return next(error)

    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, 200, data!)
  }

  async fetchNotifications(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      NotificationService.fetchUserNotifications(req.query),
    )

    if (error) return next(error)

    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, 200, data!)
  }
}

export default new NotificationController()
