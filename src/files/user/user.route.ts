import express from "express"
import validate from "../../validations/validate"
import { checkSchema } from "express-validator"
import loginUserValidation from "../../validations/user/loginPartner.validation"
import createUserValidation from "../../validations/user/createPartner.validation"
import userController from "./user.controller"
import uploadManager from "../../utils/multer"

import { adminVerifier, isAuthenticated } from "../../utils"

const {
  createUserController,
  loginUserController,
  fetchUserController,
  updateUserController,
  fetchSingleUserController,
  getVendorByCoordController,
} = userController

const UserRouter = express.Router()

//routes
UserRouter.post(
  "/",
  validate(checkSchema(createUserValidation)),
  createUserController,
)

UserRouter.post(
  "/login",
  validate(checkSchema(loginUserValidation)),
  loginUserController,
)

UserRouter.get("/", fetchUserController)

UserRouter.patch("/:userId", updateUserController)

UserRouter.get("/search", getVendorByCoordController)

export default UserRouter
