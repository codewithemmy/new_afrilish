import mongoose, { Schema, model } from "mongoose"
import { IPayout } from "./payout.interface"

const PayoutSchema = new Schema<IPayout>(
  {
    title: { type: String },
    image: { type: String },
    frequency: { type: String },
    remark: { type: String },
    amount: { type: Number },
    userType: { type: String, enum: ["Rider", "Partner"] },
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
