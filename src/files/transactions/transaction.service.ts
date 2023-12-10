import mongoose from "mongoose"
import { IResponse } from "../../constants"
import StripePaymentService from "../../providers/stripe/stripe"
import { transactionMessages } from "./transaction.messages"
import { IPaymentProvider } from "./transaction.provider"
import { ITransaction } from "./transaction.interface"
import OrderRepository from "../order/order.repository"
import TransactionRepository from "./transaction.repository"
import UserRepository from "../user/user.repository"
import { IUser } from "../user/user.interface"

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

    const amount: any = payload.amount

    if (walletBalance < amount)
      return { success: false, msg: transactionMessages.INSUFFICIENT }

    const order = await OrderRepository.fetchOrder(
      { _id: new mongoose.Types.ObjectId(payload.orderId) },
      {},
    )

    if (!order)
      return { success: false, msg: transactionMessages.PAYMENT_FAILURE }

    if (order.totalAmount !== payload.amount)
      return { success: false, msg: transactionMessages.PAYMENT_FAILURE }

    const transaction =
      await TransactionRepository.findSingleTransactionByParams({
        userId: new mongoose.Types.ObjectId(locals),
      })

    await OrderRepository.updateOrderDetails(
      {
        _id: new mongoose.Types.ObjectId(payload.orderId),
      },
      { $set: { transactionId: transaction?._id, paymentStatus: "paid" } },
    )

    await UserRepository.updateUsersProfile(
      { _id: new mongoose.Types.ObjectId(order?.orderedBy) },
      { $inc: { wallet: -amount } },
    )

    return { success: true, msg: transactionMessages.PAYMENT_SUCCESS }
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

    if (status === "Succeeded") {
      await UserRepository.updateUsersProfile(
        { _id: new mongoose.Types.ObjectId(locals) },
        { $inc: { wallet: amount } },
      )
      await TransactionRepository.updateTransactionDetails(
        {
          userId: new mongoose.Types.ObjectId(locals),
        },
        {
          $set: { status: "Succeeded" },
        },
      )
    } else {
      await TransactionRepository.updateTransactionDetails(
        {
          userId: new mongoose.Types.ObjectId(locals),
        },
        {
          $set: { status: "Failed" },
        },
      )
    }
    return { success: true, msg: transactionMessages.PAYMENT_SUCCESS }
  }
}
