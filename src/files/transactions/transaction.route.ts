import express from "express"
import { isAuthenticated } from "../../utils"
import TransactionController from "./transaction.controller"

const TransactionRouter = express.Router()

const { createPaymentIntentController, verifyPaymentController } = TransactionController

//authentications
TransactionRouter.use(isAuthenticated)

//routes
TransactionRouter.route("/").post(createPaymentIntentController)
TransactionRouter.route("/verify").post(verifyPaymentController)

export default TransactionRouter
