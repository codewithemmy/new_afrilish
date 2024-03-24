import express from "express"
import { isAuthenticated } from "../../utils"
import AdminController from "./admin.controller"
import uploadManager from "../../utils/multer"
import orderController from "../order/order.controller"
import userController from "../user/user.controller"

const AdminRouter = express.Router()

const {
  createAdmin,
  adminLogin,
  suspendUserController,
  suspendPartnerController,
  adminPasswordReset,
} = AdminController
const { adminOrderAnalysisController } = orderController
const { adminUserAnalysisController } = userController


AdminRouter.post("/", createAdmin)
AdminRouter.post("/login", adminLogin)

AdminRouter.use(isAuthenticated)


//analysis
AdminRouter.get("/order/analysis", adminOrderAnalysisController)
AdminRouter.get("/user/analysis", adminUserAnalysisController)

//user and partner
AdminRouter.patch("/user/suspend/:id", suspendUserController)
AdminRouter.patch("/partner/suspend/:vendorId", suspendPartnerController)

//reset admin password
AdminRouter.post("/reset-password", adminPasswordReset)

export default AdminRouter
