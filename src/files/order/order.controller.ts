import { NextFunction, Response, Request, query } from "express"
import { responseHandler } from "../../core/response"
import { fileModifier, manageAsyncOps } from "../../utils"
import { CustomError } from "../../utils/error"
import { statusCode } from "../../constants/statusCode"
import OrderService from "./order.service"

class OrderController {
  async evaluateOrderController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      OrderService.evaluateOrderService(req.body, res.locals.jwt),
    )
    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async fetchOrderController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      OrderService.fetchOrderService(req.query),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  // async updateSubscriptionController(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ) {
  //   const [error, data] = await manageAsyncOps(
  //     OrderService.updateOrderService(
  //       req.params.subscriptionId,
  //       req.body,
  //     ),
  //   )

  //   if (error) return next(error)
  //   if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

  //   return responseHandler(res, statusCode.SUCCESS, data!)
  // }
}

export default new OrderController()
