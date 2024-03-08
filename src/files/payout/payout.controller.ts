import { NextFunction, Response, Request, query } from "express"
import { responseHandler } from "../../core/response"
import { fileModifier, manageAsyncOps } from "../../utils"
import { CustomError } from "../../utils/error"
import { statusCode } from "../../constants/statusCode"
import PayoutService from "./payout.service"

class PayoutController {
  async createPayoutController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      PayoutService.createPayout(req.body, res.locals.jwt),
    )
    console.log("error", error)
    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async fetchPayoutController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      PayoutService.fetchPayoutService(req.query),
    )
    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async updatePayoutController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      PayoutService.updatePayoutService(req.params.payoutId, req.body),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }
}
export default new PayoutController()
