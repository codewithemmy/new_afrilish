import express from "express"
import { isAuthenticated } from "../../utils"
import subscriptionController from "./subscription.controller"
const {
  createSubscriptionController,
  fetchSubscriptionController,
  updateSubscriptionController,
} = subscriptionController

const SubscriptionRouter = express.Router()

SubscriptionRouter.use(isAuthenticated)

//routes
SubscriptionRouter.post("/", createSubscriptionController)

SubscriptionRouter.patch("/:subscriptionId", updateSubscriptionController)

SubscriptionRouter.get("/", fetchSubscriptionController)

export default SubscriptionRouter
