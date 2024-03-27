import mongoose, { mongo } from "mongoose"
import { IResponse } from "../../constants"
import StripePaymentService from "../../providers/stripe/stripe"
import { transactionMessages } from "./transaction.messages"
import { IPaymentProvider } from "./transaction.provider"
import { Expo } from "expo-server-sdk"
import TransactionRepository from "./transaction.repository"
import UserRepository from "../user/user.repository"
import { providerMessages } from "../../providers/providers.messages"
import OrderRepository from "../order/order.repository"
import { IOrder } from "../order/order.interface"
import { ITransaction } from "./transaction.interface"
import { queryConstructor } from "../../utils"
const expo = new Expo()

export default class TransactionService {
  private static paymentProvider: IPaymentProvider

  static async getConfig() {
    this.paymentProvider = new StripePaymentService()
  }

  static async initiatePayment(payload: {
    amount: number
    currency: string
    userId: any
    paymentFor: string
    orderId: any
  }): Promise<IResponse> {
    await this.getConfig()
    const { amount, currency, userId, paymentFor, orderId } = payload

    let order
    if (orderId) {
      order = { _id: new mongoose.Types.ObjectId(orderId) }
    }

    if (!paymentFor)
      return {
        success: false,
        msg: `paymentFor cannot be empty`,
      }

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
      paymentFor,
      type: paymentFor === "fund-wallet" ? "wallet" : "order",
      order,
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

    const getTransaction =
      await TransactionRepository.findSingleTransactionByParams({
        transactionId: paymentIntentSucceeded?.id,
      })

    if (getTransaction?.paymentFor === "fund-wallet") {
      const transaction = await TransactionRepository.updateTransactionDetails(
        { transactionId: paymentIntentSucceeded?.id },
        { status: "completed" },
      )

      await UserRepository.updateUsersProfile(
        { _id: new mongoose.Types.ObjectId(transaction?.userId) },
        { $inc: { wallet: transaction?.amount } },
      )

      const customer = await UserRepository.fetchUser(
        { _id: new mongoose.Types.ObjectId(getTransaction.userId) },
        {},
      )

      let message: any = {
        to: `${customer?.deviceId}`,
        sound: "default",
        title: "Wallet Funded",
        body: "Wallet successfully funded",
      }

      await expo.sendPushNotificationsAsync([message])
    }
    if (getTransaction?.paymentFor === "normal-order") {
      const transaction = await TransactionRepository.updateTransactionDetails(
        { transactionId: paymentIntentSucceeded?.id },
        { status: "completed" },
      )

      await OrderRepository.updateOrderDetails(
        {
          _id: new mongoose.Types.ObjectId(transaction?.order),
        },
        { paymentStatus: "paid", isConfirmed: true },
      )

      const customer = await UserRepository.fetchUser(
        { _id: new mongoose.Types.ObjectId(getTransaction.userId) },
        {},
      )

      let message: any = {
        to: `${customer?.deviceId}`,
        sound: "default",
        title: "Order Placed",
        body: "You have successfully place an order",
      }

      await expo.sendPushNotificationsAsync([message])
    }
  }

  static async confirmWalletOrderService(
    payload: Partial<IOrder>,
    userId: any,
  ) {
    const { orderId, isWallet } = payload
    if (!orderId)
      return {
        success: false,
        msg: `orderId cannot be empty`,
      }

    const order = await OrderRepository.fetchOrder(
      {
        _id: new mongoose.Types.ObjectId(orderId),
        orderedBy: new mongoose.Types.ObjectId(userId),
      },
      {},
    )

    if (order?.paymentStatus === "paid" || order?.isConfirmed)
      return { success: false, msg: `Order already confirmed as paid` }

    if (!order)
      return {
        success: false,
        msg: `orderId not available`,
      }

    const user = await UserRepository.fetchUser(
      {
        _id: new mongoose.Types.ObjectId(userId),
      },
      {},
    )

    if (!user)
      return {
        success: false,
        msg: `user does not exist`,
      }

    const totalAmount = Number(order?.totalAmount)
    const userWallet = Number(user?.wallet)

    if (totalAmount > userWallet)
      return {
        success: false,
        msg: `insufficient funds, kindly fund your wallet`,
      }

    await OrderRepository.updateOrderDetails(
      {
        _id: new mongoose.Types.ObjectId(order._id),
      },
      { paymentStatus: "paid", isConfirmed: true, isWallet },
    )

    const customer = await UserRepository.fetchUser(
      { _id: new mongoose.Types.ObjectId(order.orderedBy) },
      {},
    )

    let message: any = {
      to: `${customer?.deviceId}`,
      sound: "default",
      title: "Order Notification",
      body: "Order Successfully Created",
    }

    await expo.sendPushNotificationsAsync([message])

    return {
      success: true,
      msg: `successful`,
    }
  }

  static async fetchTransactionService(
    transactionPayload: Partial<ITransaction>,
    locals: any,
  ) {
    const { error, params, limit, skip, sort } = queryConstructor(
      transactionPayload,
      "createdAt",
      "Transaction",
    )

    if (error) return { success: false, msg: error }
    let extra = {}
    if (!locals.isAdmin) {
      extra = { userId: new mongoose.Types.ObjectId(locals._id) }
    }

    const transaction = await TransactionRepository.fetchTransactionsByParams({
      ...params,
      ...extra,
      limit,
      skip,
      sort,
    })

    if (transaction.length < 1)
      return {
        success: false,
        msg: transactionMessages.TRANSACTION_NOT_FOUND,
        data: [],
      }

    return {
      success: true,
      msg: transactionMessages.TRANSACTION_FETCHED,
      data: transaction,
    }
  }
}
