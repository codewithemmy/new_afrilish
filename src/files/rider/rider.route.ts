import express from "express"
import validate from "../../validations/validate"
import { checkSchema } from "express-validator"
import createPartnerValidation from "../../validations/partner/createPartner.validation"
import riderController from "./riderController/rider.controller"

const RiderRouter = express.Router()

const {
  createRiderController,
  resendOtpController,
  verifyRiderController,
  loginRiderController,
  forgotPasswordController,
  changePasswordController,
  resetPasswordController,
} = riderController

//routes
RiderRouter.post("/", createRiderController)
RiderRouter.post("/verify", verifyRiderController)
RiderRouter.post("/login", loginRiderController)
RiderRouter.post("/forgot-password", forgotPasswordController)
RiderRouter.post("/reset-password", resetPasswordController)
RiderRouter.post("/resend-otp", resendOtpController)
RiderRouter.post("/change-password", changePasswordController)

export default RiderRouter
