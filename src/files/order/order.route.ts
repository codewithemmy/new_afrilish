import express from "express"
import { isAuthenticated } from "../../utils"
import orderController from "./order.controller"
const { createOrderController } = orderController

const OrderRouter = express.Router()

OrderRouter.use(isAuthenticated)

//routes
OrderRouter.post("/", createOrderController)

export default OrderRouter
