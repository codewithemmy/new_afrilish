import express from "express"
import { isAuthenticated } from "../../utils"
import TransactionController from "./transaction.controller"

const TransactionRouter = express.Router()

const {
  createPaymentIntentController,
  stripeWebHookController,
  confirmWalletController,
  fetchTransactionController,
} = TransactionController

TransactionRouter.route("/stripe-webhook").post(stripeWebHookController)

// TransactionRouter.use(isAuthenticated)

//routes
TransactionRouter.route("/").post(createPaymentIntentController)
TransactionRouter.route("/wallet/confirm").post(confirmWalletController)
TransactionRouter.route("/").get(fetchTransactionController)

export default TransactionRouter
