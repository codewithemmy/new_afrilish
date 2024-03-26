import express from "express"
import { isAuthenticated } from "../../utils"
import payoutController from "./payout.controller"
import validate from "../../validations/validate"
import { checkSchema } from "express-validator"
import createPayout from "../../validations/payout/payout.validation"
const PayoutRouter = express.Router()

const {
  createPayoutController,
  fetchPayoutController,
  updatePayoutController,
} = payoutController

PayoutRouter.use(isAuthenticated)
PayoutRouter.get("/", fetchPayoutController)

//routes
PayoutRouter.post(
  "/",
  validate(checkSchema(createPayout)),
  createPayoutController,
)

PayoutRouter.patch("/:payoutId", updatePayoutController)

export default PayoutRouter
