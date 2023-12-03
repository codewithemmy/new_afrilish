import express from "express"
import validate from "../../validations/validate"
import { checkSchema } from "express-validator"
import createPartnerValidation from "../../validations/partner/createPartner.validation"
import loginPartnerValidation from "../../validations/partner/loginPartner.validation"
import partnerController from "./partner.controller"
import uploadManager from "../../utils/multer"

import { adminVerifier, isAuthenticated } from "../../utils"
// import loginPartnerValidation from "../../validations/partner/loginPartner.validation"

const PartnerRouter = express.Router()

const {
  createPartnerController,
  loginPartnerController,
  updatePartnerController,
  operationUpdateController,
  vendorController,
  fetchSinglePartnerController,
  fetchVendorController,
  updateVendorController,
  verifyPartnerController,
  forgotPasswordController,
  resetPasswordController,
  resendVerificationOtpController,
} = partnerController

//routes
PartnerRouter.post("/verify", verifyPartnerController)
PartnerRouter.post("/forgot-password", forgotPasswordController)
PartnerRouter.post("/reset-password", resetPasswordController)
PartnerRouter.post("/resend-otp", resendVerificationOtpController)

PartnerRouter.post(
  "/",
  validate(checkSchema(createPartnerValidation)),
  createPartnerController,
)

PartnerRouter.post(
  "/login",
  validate(checkSchema(loginPartnerValidation)),
  loginPartnerController,
)

PartnerRouter.use(isAuthenticated)

PartnerRouter.get("/", fetchSinglePartnerController)
PartnerRouter.patch("/vendor/operation/:vendorId", operationUpdateController)

PartnerRouter.patch("/:partnerId", updatePartnerController)

// vendor router
PartnerRouter.post(
  "/vendor",
  uploadManager("vendorImage").single("image"),
  vendorController,
)

PartnerRouter.patch(
  "/vendor/:vendorId",
  uploadManager("vendorImage").single("image"),
  updateVendorController,
)

PartnerRouter.get("/vendor", fetchVendorController)

export default PartnerRouter
