import express from "express"
import validate from "../../validations/validate"
import { checkSchema } from "express-validator"
import createUserValidation from "../../validations/user/createPartner.validation"
import userController from "./user.controller"
import itemController from "../item/item.controller"
import uploadManager from "../../utils/multer"
import { isAuthenticated } from "../../utils"
import partnerController from "../partner/partner.controller"

const { rateVendorController } = partnerController

const {
  createUserController,
  fetchUserController,
  updateUserController,
  getVendorByCoordController,
  userLoginController,
  verifyUserController,
  resendVerificationOtp,
  userAuthLoginController,
  userSupportController,
  forgotPasswordController,
  resetPasswordController,
} = userController

const { fetchItemController } = itemController

const UserRouter = express.Router()

//routes
UserRouter.post(
  "/",
  validate(checkSchema(createUserValidation)),
  createUserController,
)

UserRouter.post("/forgot-password", forgotPasswordController)
UserRouter.patch("/reset-password", resetPasswordController)
UserRouter.post("/verify", verifyUserController)
UserRouter.post("/resend-otp", resendVerificationOtp)
UserRouter.post("/login", userLoginController)
UserRouter.post("/support", userSupportController)

UserRouter.get("/", isAuthenticated, fetchUserController)

UserRouter.patch(
  "/",
  uploadManager("userImage").single("image"),
  isAuthenticated,
  updateUserController,
)
UserRouter.get("/item", fetchItemController)

UserRouter.get("/vendor", getVendorByCoordController)

//user auth login route
UserRouter.post("/login/auth", userAuthLoginController)

UserRouter.post("/vendor/rate/:id", isAuthenticated, rateVendorController)

export default UserRouter
