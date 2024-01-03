import express from "express"
import { isAuthenticated } from "../../utils"
import orderController from "./order.controller"
const {
  evaluateOrderController,
  fetchOrderController,
  updateOrderController,
  orderAnalysisController,
} = orderController

const OrderRouter = express.Router()

OrderRouter.use(isAuthenticated)

//routes
OrderRouter.post("/", evaluateOrderController)
OrderRouter.get("/", fetchOrderController)
OrderRouter.patch("/:orderId", updateOrderController)

//analysis
OrderRouter.get("/analysis", orderAnalysisController)

export default OrderRouter
