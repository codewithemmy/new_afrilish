import mongoose from "mongoose"
import { ITransaction } from "./transaction.interface"

const TransactionSchema = new mongoose.Schema<ITransaction>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    order: {
      type: mongoose.Types.ObjectId,
      ref: "Order",
    },
    vendorId: {
      type: mongoose.Types.ObjectId,
      ref: "Vendor",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
    },
    channel: {
      type: String,
      required: true,
      enum: ["stripe"],
      default: "stripe",
    },
    transactionId: {
      type: String,
    },
    type: {
      type: String,
      enum: ["wallet", "order"],
      default: "wallet",
    },
    status: {
      type: String,
      default: "pending",
      enum: ["failed", "completed", "pending", "canceled"],
    },
    paymentFor: {
      type: String,
      enum: ["fund-wallet", "normal-order"],
      default: "fund-wallet",
    },
    metaData: String,
  },
  { timestamps: true },
)

const transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema,
  "transaction",
)

export default transaction
