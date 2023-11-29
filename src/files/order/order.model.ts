import mongoose, { Schema, model } from "mongoose"
import { IOrder } from "./order.interface"

const OrderSchema = new Schema<IOrder>(
  {
    pickUpCode: { type: Number },
    orderCode: { type: Number },
    orderId: { type: String },
    itemId: [
      {
        _id: { type: mongoose.Types.ObjectId, ref: "Item" },
        quantity: { type: Number },
        price: { type: Number },
      },
    ],
    transactionId: [{ type: mongoose.Types.ObjectId, ref: "Transaction" }],
    scheduleId: { type: mongoose.Types.ObjectId, ref: "Subscription" },
    orderedBy: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    vendorId: { type: mongoose.Types.ObjectId, ref: "Vendor" },
    userEmail: { type: String },
    userName: { type: String },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "on-going", "delivered", "cancelled", "completed"],
      default: "pending",
    },
    orderDate: { type: Date },
    riderStatus: {
      type: String,
      enum: [
        "pending",
        "rejected",
        "cancelled",
        "delivered",
        "picked",
        "accepted",
        "on-road",
      ],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "rejected", "accepted"],
      default: "pending",
    },
    isDelete: { type: Boolean, default: false },
    paymentResponse: { type: String },
    ridersFee: { type: Number },
    netAmount: { type: Number },
    totalAmount: { type: Number },
    marketPlace: { type: Number },
    serviceCharge: { type: Number },
    confirmDelivery: { type: Boolean },
    remarks: { type: String },
    addNote: { type: String },
    readyTime: { type: String },
    paymentIntentId: { type: String },
    locationCoord: {
      type: { type: String },
      coordinates: [Number],
    },
  },
  { timestamps: true },
)

const order = model<IOrder>("Order", OrderSchema, "order")

export default order
