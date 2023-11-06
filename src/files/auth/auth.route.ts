import express from "express"
import authController from "./auth.controller"
const { checkSchema } = require("express-validator")
import validate from "../../validations/validate"
import createAdminValidation from "../../validations/auth/admin_validation"
import loginAdminValidation from "../../validations/auth/login_admin.validation"

const AuthRouter = express.Router()

const {
  createAdmin,
  loginAdmin,
  passwordReset
} = authController


//routes
//create entities
AuthRouter.post(
  "/create-admin",
  validate(checkSchema(createAdminValidation)),
  createAdmin
)


AuthRouter.post(
  "/login-admin",
  validate(checkSchema(loginAdminValidation)),
  loginAdmin
)
AuthRouter.post("/reset/password", passwordReset)


export default AuthRouter