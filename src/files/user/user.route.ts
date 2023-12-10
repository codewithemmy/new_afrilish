import express from "express"
import validate from "../../validations/validate"
import { checkSchema } from "express-validator"
import createUserValidation from "../../validations/user/createPartner.validation"
import userController from "./user.controller"
import uploadManager from "../../utils/multer"
import { profile } from "console"

const {
  createUserController,
  loginUserController,
  fetchUserController,
  updateUserController,
  getVendorByCoordController,
  loginCodeController,
  verifyUserController,
  resendVerificationOtp,
} = userController

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
  "/:userId",
  uploadManager("userImage").single("image"),
  updateUserController,
)

UserRouter.get("/vendor", getVendorByCoordController)

export default UserRouter
