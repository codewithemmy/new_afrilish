import mongoose from "mongoose"
import { ITransaction } from "./transaction.interface"

const TransactionSchema = new mongoose.Schema<ITransaction>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
    },
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: "Order",
      unique: true,
    },
    channel: {
      type: String,
      required: true,
      enum: ["stripe"],
      default: "stripe",
    },
    transactionId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Failed", "Succeeded", "Pending", "Canceled"],
    },
    paymentFor: {
      type: String,
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
