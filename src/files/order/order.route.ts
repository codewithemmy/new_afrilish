import express from "express"
import { isAuthenticated } from "../../utils"
import orderController from "./order.controller"
const { evaluateOrderController, fetchOrderController, updateOrderController } =
  orderController

const OrderRouter = express.Router()

OrderRouter.use(isAuthenticated)

//routes
OrderRouter.post("/", evaluateOrderController)
OrderRouter.get("/", fetchOrderController)
OrderRouter.patch("/:orderId", updateOrderController)

export default OrderRouter
