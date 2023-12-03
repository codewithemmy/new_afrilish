import express from "express"
import validate from "../../validations/validate"
import { checkSchema } from "express-validator"
import createUserValidation from "../../validations/user/createPartner.validation"
import userController from "./user.controller"

import { adminVerifier, isAuthenticated } from "../../utils"

const {
  createUserController,
  loginUserController,
  fetchUserController,
  updateUserController,
  getVendorByCoordController,
  loginCodeController,
} = userController

const UserRouter = express.Router()

//routes
UserRouter.post(
  "/",
  validate(checkSchema(createUserValidation)),
  createUserController,
)

UserRouter.post("/login", loginUserController)

UserRouter.post("/login-code", loginCodeController)

UserRouter.get("/", fetchUserController)

UserRouter.patch("/:userId", updateUserController)

UserRouter.get("/vendor", getVendorByCoordController)

export default UserRouter
