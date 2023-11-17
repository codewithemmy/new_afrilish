import mongoose from "mongoose"
import { IResponse } from "../../constants"
import StripePaymentService from "../../providers/stripe/stripe"
import { transactionMessages } from "./transaction.messages"
import { IPaymentProvider } from "./transaction.provider"
import { ITransaction } from "./transaction.interface"
import OrderRepository from "../order/order.repository"
import TransactionRepository from "./transaction.repository"

export default class TransactionService {
  private static paymentProvider: IPaymentProvider

  static async getConfig() {
    this.paymentProvider = new StripePaymentService()
  }

  static async initiatePayment(payload: {
    amount: number
    currency: string
  }): Promise<IResponse> {
    await this.getConfig()
    const { amount, currency } = payload
    const initializePayment = await this.paymentProvider.initiatePaymentIntent({
      amount,
      currency,
    })

    if (!initializePayment)
      return {
        success: false,
        msg: transactionMessages.CREATE_TRANSACTION_FAILURE,
      }

    return initializePayment
  }

  static async verifyPayment(
    payload: Partial<ITransaction>,
    locals: any,
  ): Promise<IResponse> {
    const order = await OrderRepository.fetchOrder(
      { _id: new mongoose.Types.ObjectId(payload.orderId) },
      {},
    )
    if (!order)
      return { success: false, msg: transactionMessages.PAYMENT_FAILURE }

    if (order.totalAmount !== payload.amount)
      return { success: false, msg: transactionMessages.PAYMENT_FAILURE }

    const transaction = await TransactionRepository.create({
      userId: new mongoose.Types.ObjectId(locals),
      ...payload,
    })

    if (payload.status === "Succeeded") {
      await OrderRepository.updateOrderDetails(
        {
          _id: new mongoose.Types.ObjectId(payload.orderId),
        },
        { $set: { transactionId: transaction._id, paymentStatus: "paid" } },
      )
    } else {
      await OrderRepository.updateOrderDetails(
        {
          _id: new mongoose.Types.ObjectId(payload.orderId),
        },
        { $set: { transactionId: transaction._id, paymentStatus: "failed" } },
      )
    }
    return { success: true, msg: transactionMessages.PAYMENT_SUCCESS }
  }
}
