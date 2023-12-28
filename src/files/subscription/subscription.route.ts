import express from "express"
import { isAuthenticated } from "../../utils"
import subscriptionController from "./subscription.controller"
import orderController from "../order/order.controller"
const {
  createSubscriptionController,
  fetchSubscriptionController,
  updateSubscriptionController,
} = subscriptionController

const { evaluateScheduleOrderController } = orderController

const SubscriptionRouter = express.Router()

SubscriptionRouter.use(isAuthenticated)

//routes
SubscriptionRouter.post("/", createSubscriptionController)

SubscriptionRouter.patch("/:subscriptionId", updateSubscriptionController)

SubscriptionRouter.get("/", fetchSubscriptionController)
SubscriptionRouter.post("/order", evaluateScheduleOrderController)

export default SubscriptionRouter
