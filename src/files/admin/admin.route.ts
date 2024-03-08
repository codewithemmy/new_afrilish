import express from "express"
import { isAuthenticated } from "../../utils"
import AdminController from "./admin.controller"
import uploadManager from "../../utils/multer"
import orderController from "../order/order.controller"
import userController from "../user/user.controller"

const AdminRouter = express.Router()

const { createAdmin, adminLogin, suspendUserController } = AdminController
const { adminOrderAnalysisController } = orderController
const { adminUserAnalysisController } = userController

AdminRouter.post("/", createAdmin)
AdminRouter.post("/login", adminLogin)

//analysis
AdminRouter.get("/order/analysis", adminOrderAnalysisController)
AdminRouter.get("/user/analysis", adminUserAnalysisController)

//user
AdminRouter.patch("/user/suspend/:id", suspendUserController)

export default AdminRouter
