import { NextFunction, Response, Request } from "express"
import { responseHandler } from "../../core/response"
import { fileModifier, manageAsyncOps } from "../../utils"
import { CustomError } from "../../utils/error"
import { statusCode } from "../../constants/statusCode"
import UserService from "./user.service"

class UserController {
  async createUserController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(UserService.createUser(req.body))

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async loginCodeController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      UserService.loginCodeService(req.body),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async loginUserController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(UserService.loginUser(req.body))

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async fetchUserController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      UserService.fetchUserService(req.query),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async updateUserController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      UserService.updateUserProfile({
        params: req.params as { userId: string },
        userPayload: req.body,
      }),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async fetchSingleUserController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      UserService.fetchSingleUser(res.locals.jwt._id),
    )
    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async getVendorByCoordController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      UserService.getVendorByCoordService(req.query),
    )
    
    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async verifyUserController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      UserService.verifyUserService(req.body),
    )
    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async resendVerificationOtp(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      UserService.resendVerificationService(req.body),
    )
    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }
}

export default new UserController()
