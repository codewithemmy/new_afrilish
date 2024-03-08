import { NextFunction, Response, Request } from "express"
import { responseHandler } from "../../core/response"
import { fileModifier, manageAsyncOps } from "../../utils"
import { CustomError } from "../../utils/error"
import AdminService from "./admin.service"
import UserService from "../user/user.service"

class AdminController {
  async createAdmin(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(AdminService.create(req.body))

    if (error) return next(error)

    if (!data?.success) return next(new CustomError(data!.msg, 400))

    return responseHandler(res, 200, data!)
  }

  async adminLogin(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(AdminService.login(req.body))
    if (error) return next(error)

    if (!data?.success) return next(new CustomError(data!.msg, 400))

    return responseHandler(res, 200, data!)
  }

  async suspendUserController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      UserService.updateUserProfile({
        params: req.params.id,
        userPayload: { ...req.body },
      }),
    )

    if (error) return next(error)

    if (!data?.success) return next(new CustomError(data!.msg, 400))

    return responseHandler(res, 200, data!)
  }

  async suspendPartnerController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      AdminService.suspendPartner(req.params.vendorId, req.body),
    )

    if (error) return next(error)

    if (!data?.success) return next(new CustomError(data!.msg, 400))

    return responseHandler(res, 200, data!)
  }
}

export default new AdminController()
