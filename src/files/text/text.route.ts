import express from "express"
import uploadManager from "../../utils/multer"

import { isAuthenticated } from "../../utils"
import textController from "./text.controller"
// import loginPartnerValidation from "../../validations/partner/loginPartner.validation"

const TextRouter = express.Router()

const { createTextController, getTextController } = textController

//routes
TextRouter.post(
  "/",
  uploadManager("image").single("image"),
  createTextController,
)

TextRouter.get("/", getTextController)

export default TextRouter
