import express from "express"
import { isAuthenticated } from "../../utils"
import orderController from "./order.controller"
const { evaluateOrderController, fetchOrderController } = orderController

const OrderRouter = express.Router()

OrderRouter.use(isAuthenticated)

//routes
OrderRouter.post("/", evaluateOrderController)
OrderRouter.get("/", fetchOrderController)

export default OrderRouter
