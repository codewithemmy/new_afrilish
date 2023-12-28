import express from "express"
import { isAuthenticated } from "../../utils"
import TransactionController from "./transaction.controller"

const TransactionRouter = express.Router()

const { createPaymentIntentController, stripeWebHookController } =
  TransactionController

TransactionRouter.route("/stripe-webhook").post(stripeWebHookController)

TransactionRouter.use(isAuthenticated)

//routes
TransactionRouter.route("/").post(createPaymentIntentController)

export default TransactionRouter
