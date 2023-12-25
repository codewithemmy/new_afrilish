import express from "express"
import { isAuthenticated } from "../../utils"
import TransactionController from "./transaction.controller"

const TransactionRouter = express.Router()

const {
  createPaymentIntentController,
  verifyPaymentController,
  chargeWalletController,
} = TransactionController

//authentications
// TransactionRouter.use(isAuthenticated)

//routes
TransactionRouter.route("/").post(createPaymentIntentController)
TransactionRouter.route("/verify").post(verifyPaymentController)
TransactionRouter.route("/wallet").post(chargeWalletController)

export default TransactionRouter
