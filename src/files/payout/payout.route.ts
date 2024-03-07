import express from "express"
import uploadManager from "../../utils/multer"
import { adminVerifier, isAuthenticated } from "../../utils"
import payoutController from "./payout.controller"

const PayoutRouter = express.Router()

const {
  createPayoutController,
  fetchPayoutController,
  updatePayoutController,
} = payoutController

PayoutRouter.use(isAuthenticated)
PayoutRouter.get("/", fetchPayoutController)

//routes
PayoutRouter.post("/", createPayoutController)

PayoutRouter.patch(
  "/:payoutId",
  uploadManager("image").single("image"),
  updatePayoutController,
)

export default PayoutRouter
