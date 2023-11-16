import mongoose from "mongoose"
import { IResponse } from "../../constants"
import StripePaymentService from "../../providers/stripe/stripe"
import { transactionMessages } from "./transaction.messages"
import { IPaymentProvider } from "./transaction.provider"

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
}
