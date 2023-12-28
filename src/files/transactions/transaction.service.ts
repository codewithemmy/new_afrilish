import mongoose, { mongo } from "mongoose"
import { IResponse } from "../../constants"
import StripePaymentService from "../../providers/stripe/stripe"
import { transactionMessages } from "./transaction.messages"
import { IPaymentProvider } from "./transaction.provider"

import TransactionRepository from "./transaction.repository"
import UserRepository from "../user/user.repository"
import { providerMessages } from "../../providers/providers.messages"

export default class TransactionService {
  private static paymentProvider: IPaymentProvider

  static async getConfig() {
    this.paymentProvider = new StripePaymentService()
  }

  static async initiatePayment(payload: {
    amount: number
    currency: string
    userId: any
    orderId: any
  }): Promise<IResponse> {
    await this.getConfig()
    const { amount, currency, userId } = payload
    const initializePayment = await this.paymentProvider.initiatePaymentIntent({
      amount,
      currency,
    })

    const { data } = initializePayment
    const { id, client_secret } = data

    if (!initializePayment)
      return {
        success: false,
        msg: transactionMessages.CREATE_TRANSACTION_FAILURE,
      }

    const transaction = await TransactionRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      amount,
      currency,
      transactionId: id,
      paymentFor: "fund-wallet",
    })

    if (!transaction)
      return { success: false, msg: `unable to create transaction` }

    return {
      success: true,
      msg: providerMessages.INITIATE_PAYMENT_SUCCESS,
      data: { client_secret, id, amount, currency },
    }
  }

  static async verifyPayment(event: any) {
    // Handle the event
    try {
      switch (event.type) {
        case "payment_intent.canceled":
          await this.handleCanceledPaymentIntent(event)
          break
        case "payment_intent.payment_failed":
          await this.handleFailedPaymentIntent(event)
          break
        case "payment_intent.succeeded":
          await this.handleSucceededPaymentIntent(event)
          break
        default:
          return {
            success: true,
            msg: transactionMessages.CREATE_TRANSACTION_SUCCESS,
          }
      }
    } catch (error) {
      console.error("Error in verifyPayment:", error)
      throw error
    }
  }

  private static async handleCanceledPaymentIntent(event: any) {
    const paymentIntentCanceled = event.data.object
    await TransactionRepository.updateTransactionDetails(
      { transactionId: paymentIntentCanceled?.id },
      { status: "canceled" },
    )
  }

  private static async handleFailedPaymentIntent(event: any) {
    const paymentIntentPaymentFailed = event.data.object
    await TransactionRepository.updateTransactionDetails(
      { transactionId: paymentIntentPaymentFailed?.id },
      { status: "failed" },
    )
  }

  private static async handleSucceededPaymentIntent(event: any) {
    const paymentIntentSucceeded = event.data.object

    const transaction = await TransactionRepository.updateTransactionDetails(
      { transactionId: paymentIntentSucceeded?.id },
      { status: "completed" },
    )

    await UserRepository.updateUsersProfile(
      { _id: new mongoose.Types.ObjectId(transaction?.userId) },
      { $inc: { wallet: transaction?.amount } },
    )
  }
}
