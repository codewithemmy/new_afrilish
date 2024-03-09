import express from "express"
import { isAuthenticated, adminVerifier } from "../../utils"
import NotificationController from "./notification.controller"

const NotificationRouter = express.Router()

const { fetchNotifications, createNotification } = NotificationController

//authentications
NotificationRouter.use(isAuthenticated)

//routes
NotificationRouter.post("/", createNotification)
NotificationRouter.get("/", fetchNotifications)

export default NotificationRouter
