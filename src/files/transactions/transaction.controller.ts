import { NextFunction, Response, Request } from "express"
import { responseHandler } from "../../core/response"
import { manageAsyncOps } from "../../utils"
import { CustomError } from "../../utils/error"
import TransactionService from "./transaction.service"
import { statusCode } from "../../constants/statusCode"
import config from "../../core/config"
import Stripe from "stripe"
const stripeKey = process.env.STRIPE_KEY
if (!stripeKey) {
  throw new Error("Stripe key is not defined")
}
const stripe = new Stripe(stripeKey)

class TransactionController {
  async createPaymentIntentController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      TransactionService.initiatePayment(req.body),
    )
    console.log("error", error)
    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async stripeWebHookController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // const rawBodyBuffer = Buffer.from(JSON.stringify(req.body))
      // const sig: any = req.headers["stripe-signature"]
      const event = req.body

      console.log("Received Stripe event:", event?.type)

      const [error, data] = await manageAsyncOps(
        TransactionService.verifyPayment(event),
      )

      if (error) return next(error)
      if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

      return responseHandler(res, statusCode.CREATED, data!)
    } catch (error) {
      console.error("Error in stripeWebHookController:", error)
      next(error)
    }
  }
}

export default new TransactionController()
