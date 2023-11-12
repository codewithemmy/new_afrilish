import mongoose, { Schema, model } from "mongoose"
import { ISubscription } from "./subscription.interface"

const SubscriptionSchema = new Schema<ISubscription>(
  {
    startDate: { type: Date },
    endDate: { type: Date },
    breakfast: {
      dayOne: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dayTwo: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dayThree: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dayFour: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dayFive: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      daySix: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      daySeven: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
    },
    lunch: {
      dayOne: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dayTwo: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dayThree: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dayFour: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dayFive: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      daySix: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      daySeven: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
    },
    dinner: {
      dayOne: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dayTwo: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dayThree: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dayFour: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      dayFive: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      daySix: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
      daySeven: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
    },
    isDelete: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "paused", "pending"],
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
