import mongoose, { mongo } from "mongoose"
import { IResponse } from "../../constants"
import StripePaymentService from "../../providers/stripe/stripe"
import { transactionMessages } from "./transaction.messages"
import { IPaymentProvider } from "./transaction.provider"
import { ITransaction } from "./transaction.interface"
import OrderRepository from "../order/order.repository"
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

  static async verifyPayment(
    payload: Partial<ITransaction>,
    locals: any,
  ): Promise<IResponse> {
    const { transactionId, status, amount } = payload

    const transaction = await TransactionRepository.create({
      userId: new mongoose.Types.ObjectId(locals),
      transactionId,
      amount,
    })

    const succeeded: string = "Succeeded"

    if (status === succeeded) {
      await UserRepository.updateUsersProfile(
        { _id: new mongoose.Types.ObjectId(locals) },
        { $inc: { wallet: amount } },
      )
      await TransactionRepository.updateTransactionDetails(
        {
          userId: new mongoose.Types.ObjectId(locals),
        },
        {
          $set: { status: "completed" },
        },
      )
    } else {
      await TransactionRepository.updateTransactionDetails(
        {
          userId: new mongoose.Types.ObjectId(locals),
        },
        {
          $set: { status: "failed" },
        },
      )
    }
    return { success: true, msg: transactionMessages.PAYMENT_SUCCESS }
  }

  static async chargeWalletService(
    payload: Partial<ITransaction>,
    locals: any,
  ): Promise<IResponse> {
    const confirmWallet = await UserRepository.fetchUser(
      {
        _id: new mongoose.Types.ObjectId(locals),
      },
      {},
    )

    const walletBalance: any = confirmWallet?.wallet

    const order = await OrderRepository.fetchOrder(
      {
        _id: new mongoose.Types.ObjectId(payload.orderId),
        orderedBy: new mongoose.Types.ObjectId(locals),
      },
      {},
    )

    if (!order) return { success: false, msg: transactionMessages.NO_ORDER }

    const orderAmount: any = order.totalAmount

    if (orderAmount > walletBalance)
      return { success: false, msg: transactionMessages.INSUFFICIENT }

    return { success: true, msg: transactionMessages.WALLET_VERIFIED }
  }
}
