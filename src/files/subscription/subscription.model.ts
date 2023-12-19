import mongoose, { Schema, model } from "mongoose"
import { ISubscription } from "./subscription.interface"

const SubscriptionSchema = new Schema<ISubscription>(
  {
    startDate: { type: Date },
    endDate: { type: Date },
    monday: {
      breakfast: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      launch: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dinner: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
    },
    tuesday: {
      breakfast: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      launch: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dinner: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
    },
    wednesday: {
      breakfast: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      launch: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dinner: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
    },
    thursday: {
      breakfast: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      launch: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dinner: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
    },
    friday: {
      breakfast: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      launch: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dinner: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
    },
    saturday: {
      breakfast: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      launch: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dinner: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
    },
    sunday: {
      breakfast: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      launch: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dinner: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
    },
    isDelete: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "paused", "pending", "completed"],
      default: "pending",
    },
    userId: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
)

const subscription = model<ISubscription>(
  "Subscription",
  SubscriptionSchema,
  "subscription",
)

export default subscription
