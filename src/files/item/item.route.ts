import express from "express"
import uploadManager from "../../utils/multer"

import { adminVerifier, isAuthenticated } from "../../utils"
import itemController from "./item.controller"
// import loginPartnerValidation from "../../validations/partner/loginPartner.validation"

const ItemRouter = express.Router()

const { createItemController, fetchItemController, updateItemController } =
  itemController

ItemRouter.use(isAuthenticated)

//routes
ItemRouter.post(
  "/",
  uploadManager("itemImage").single("image"),
  createItemController,
)

ItemRouter.route("/").get(fetchItemController)
ItemRouter.patch(
  "/:itemId",
  uploadManager("itemImage").single("image"),
  updateItemController,
)

export default ItemRouter
