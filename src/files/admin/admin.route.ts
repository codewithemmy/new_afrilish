import express from "express"
import { isAuthenticated } from "../../utils"
import AdminController from "./admin.controller"
import uploadManager from "../../utils/multer"

const AdminRouter = express.Router()

const { createAdmin, adminLogin } = AdminController

AdminRouter.post("/", createAdmin)
AdminRouter.post("/login", adminLogin)

export default AdminRouter
