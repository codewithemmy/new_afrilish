import mongoose, { Schema, model } from "mongoose"
import { ISubscription } from "./subscription.interface"

const SubscriptionSchema = new Schema<ISubscription>(
  {
    startDate: { type: Date },
    endDate: { type: Date },
    monday: {
      breakfast: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
      lunch: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
      dinner: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
    },
    tuesday: {
      breakfast: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
      lunch: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
      dinner: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
    },
    wednesday: {
      breakfast: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
      lunch: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
      dinner: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
    },
    thursday: {
      breakfast: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
      lunch: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
      dinner: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
    },
    friday: {
      breakfast: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
      lunch: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
      dinner: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
    },
    saturday: {
      breakfast: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
      lunch: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
      dinner: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
    },
    sunday: {
      breakfast: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
      lunch: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
      dinner: {
        item: [
          { type: mongoose.Types.ObjectId, ref: "Item" },
          { type: Number },
          { price: Number },
        ],
      },
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
