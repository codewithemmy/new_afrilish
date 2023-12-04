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
ItemRouter.route("/:itemId").patch(updateItemController)

// ItemRouter.patch(
//   "/:menuId",
//   uploadManager("menuImage").single("image"),
//   updateMenuController,
// )
// ItemRouter.get("/", fetchMenuController)

export default ItemRouter
