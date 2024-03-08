import mongoose, { Schema, model } from "mongoose"
import { IPayout } from "./payout.interface"

const PayoutSchema = new Schema<IPayout>(
  {
    title: { type: String },
    remark: { type: String },
    refNumber: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
    },
    amount: { type: Number },
    userType: { type: String, enum: ["Rider", "Vendor"] },
    initiator: { type: String, enum: ["Rider", "Vendor", "Admin"] },
    initiatorId: {
      type: mongoose.Types.ObjectId,
      refPath: "initiator",
    },
    recipient: {
      type: mongoose.Types.ObjectId,
      refPath: "userType",
    },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const payout = model<IPayout>("Payout", PayoutSchema, "payout")

export default payout
