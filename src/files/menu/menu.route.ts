import express from "express"
import validate from "../../validations/validate"
import { checkSchema } from "express-validator"
import uploadManager from "../../utils/multer"

import { adminVerifier, isAuthenticated } from "../../utils"
import menuController from "./menu.controller"
// import loginPartnerValidation from "../../validations/partner/loginPartner.validation"

const MenuRouter = express.Router()

const { createMenuController, fetchMenuController, updateMenuController } =
  menuController

MenuRouter.get("/", fetchMenuController)

MenuRouter.use(isAuthenticated)

//routes
MenuRouter.post(
  "/",
  uploadManager("menuImage").single("image"),
  createMenuController,
)

MenuRouter.patch(
  "/:menuId",
  uploadManager("menuImage").single("image"),
  updateMenuController,
)

export default MenuRouter
