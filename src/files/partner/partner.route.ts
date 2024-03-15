import express from "express"
import validate from "../../validations/validate"
import { checkSchema } from "express-validator"
import createPartnerValidation from "../../validations/partner/createPartner.validation"
import loginPartnerValidation from "../../validations/partner/loginPartner.validation"
import partnerController from "./partner.controller"
import uploadManager from "../../utils/multer"

import { isAuthenticated } from "../../utils"

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
  partnerAuthLoginController,
  updatePaymentController,
  getVendorPaymentController,
  deleteVendorPaymentController,
  getVendorAnalysisController,
  switchVendorController,
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

//google and apple login
PartnerRouter.post("/login/auth", partnerAuthLoginController)

PartnerRouter.use(isAuthenticated)

PartnerRouter.patch(
  "/vendor",
  uploadManager("vendorImage").single("image"),
  updateVendorController,
)
PartnerRouter.get("/", fetchSinglePartnerController)
PartnerRouter.patch("/vendor/operation", operationUpdateController)

PartnerRouter.patch("/:partnerId", updatePartnerController)

// vendor router
PartnerRouter.post(
  "/vendor",
  uploadManager("vendorImage").single("image"),
  vendorController,
)

PartnerRouter.get("/vendor", fetchVendorController)

PartnerRouter.patch("/vendor/payment", updatePaymentController)
PartnerRouter.get("/vendor/payment", getVendorPaymentController)
PartnerRouter.delete("/vendor/payment", deleteVendorPaymentController)
PartnerRouter.post("/vendor/switch/:vendorId", switchVendorController)

//vendor analysis
PartnerRouter.get("/vendor/admin/analysis", getVendorAnalysisController)

export default PartnerRouter
