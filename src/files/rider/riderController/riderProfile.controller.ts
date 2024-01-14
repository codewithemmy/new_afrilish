import { NextFunction, Response, Request } from "express"
import { responseHandler } from "../../../core/response"
import { manageAsyncOps } from "../../../utils"
import { CustomError } from "../../../utils/error"
import { statusCode } from "../../../constants/statusCode"
import RiderService from "../riderService/riderProfile.service"

class RiderProfileController {
  async riderProfile(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      RiderService.riderProfile(res.locals.jwt._id),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  // async resendOtpController(req: Request, res: Response, next: NextFunction) {
  //   const [error, data] = await manageAsyncOps(
  //     RiderService.resentOtpService(req.body),
  //   )

  //   if (error) return next(error)
  //   if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

  //   return responseHandler(res, statusCode.CREATED, data!)
  // }

  // async verifyRiderController(req: Request, res: Response, next: NextFunction) {
  //   const [error, data] = await manageAsyncOps(
  //     RiderService.verifyRiderService(req.body),
  //   )
  //   if (error) return next(error)
  //   if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

  //   return responseHandler(res, statusCode.SUCCESS, data!)
  // }

  // async loginRiderController(req: Request, res: Response, next: NextFunction) {
  //   const [error, data] = await manageAsyncOps(
  //     RiderService.loginRider(req.body),
  //   )

  //   if (error) return next(error)
  //   if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

  //   return responseHandler(res, statusCode.SUCCESS, data!)
  // }

  // async forgotPasswordController(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ) {
  //   const [error, data] = await manageAsyncOps(
  //     RiderService.forgotPasswordService(req.body),
  //   )
  //   console.log("error", error)
  //   if (error) return next(error)
  //   if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

  //   return responseHandler(res, statusCode.SUCCESS, data!)
  // }

  // async changePasswordController(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ) {
  //   const [error, data] = await manageAsyncOps(
  //     RiderService.changeRiderPassword(req.body, res.locals.jwt._id),
  //   )

  //   if (error) return next(error)
  //   if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

  //   return responseHandler(res, statusCode.SUCCESS, data!)
  // }

  // async resetPasswordController(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ) {
  //   const [error, data] = await manageAsyncOps(
  //     RiderService.resetRiderPassword(req.body),
  //   )

  //   if (error) return next(error)
  //   if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

  //   return responseHandler(res, statusCode.SUCCESS, data!)
  // }
}

export default new RiderProfileController()
