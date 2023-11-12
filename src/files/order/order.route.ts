import express from "express"
import { isAuthenticated } from "../../utils"
import orderController from "./order.controller"
const { createOrderController, fetchOrderController } = orderController

const OrderRouter = express.Router()

OrderRouter.use(isAuthenticated)

//routes
OrderRouter.post("/", createOrderController)
OrderRouter.get("/", fetchOrderController)

export default OrderRouter
