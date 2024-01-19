import express from "express"
import uploadManager from "../../utils/multer"

import { adminVerifier, isAuthenticated } from "../../utils"
import menuController from "./menu.controller"

const MenuRouter = express.Router()

const {
  createMenuController,
  fetchMenuController,
  updateMenuController,
  deleteMenuController,
} = menuController

MenuRouter.get("/", fetchMenuController)

// MenuRouter.use(isAuthenticated)

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

MenuRouter.delete("/:menuId", deleteMenuController)

export default MenuRouter
