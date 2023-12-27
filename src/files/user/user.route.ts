import express from "express"
import validate from "../../validations/validate"
import { checkSchema } from "express-validator"
import createUserValidation from "../../validations/user/createPartner.validation"
import userController from "./user.controller"
import itemController from "../item/item.controller"
import uploadManager from "../../utils/multer"
import { isAuthenticated } from "../../utils"

const {
  createUserController,
  loginUserController,
  fetchUserController,
  updateUserController,
  getVendorByCoordController,
  loginCodeController,
  verifyUserController,
  resendVerificationOtp,
  userAuthLoginController,
} = userController

const { fetchItemController } = itemController

const UserRouter = express.Router()

//routes
UserRouter.post(
  "/",
  validate(checkSchema(createUserValidation)),
  createUserController,
)

UserRouter.post("/login", loginUserController)
UserRouter.post("/verify", verifyUserController)
UserRouter.post("/resend-otp", resendVerificationOtp)
UserRouter.post("/login-code", loginCodeController)

UserRouter.get("/", fetchUserController)

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

export default UserRouter
