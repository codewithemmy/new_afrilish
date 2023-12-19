import mongoose from "mongoose"
import { IResponse } from "../../constants"
import { queryConstructor, verifyPassword } from "../../utils"
import SubscriptionRepository from "./subscription.repository"
import { subscriptionMessages } from "./subscription.messages"
import { ISubscription } from "./subscription.interface"

export default class SubscriptionService {
  static async createSubscription(
    subscriptionPayload: Partial<ISubscription>,
    locals: any,
  ): Promise<IResponse> {
    const { startDate, endDate } = subscriptionPayload

    const exist = await SubscriptionRepository.fetchSubscription(
      { startDate, endDate, userId: new mongoose.Types.ObjectId(locals) },
      {},
    )

    if (exist)
      return { success: false, msg: subscriptionMessages.EXISTING_SUBSCRIPTION }

    const subscription = await SubscriptionRepository.createSubscription({
      userId: new mongoose.Types.ObjectId(locals),
      ...subscriptionPayload,
    })

    if (!subscription)
      return { success: false, msg: subscriptionMessages.SUBSCRIPTION_FAILURE }

    return {
      success: true,
      msg: subscriptionMessages.SUBSCRIPTION_DATE,
      data: subscription,
    }
  }

  static async fetchSubscriptionService(
    subscriptionPayload: Partial<ISubscription>,
    userId: any,
  ) {
    const { error, params, limit, skip, sort } = queryConstructor(
      subscriptionPayload,
      "createdAt",
      "Subscription",
    )

    if (error) return { success: false, msg: error }

    let user = { userId: new mongoose.Types.ObjectId(userId) }
    const subscription = await SubscriptionRepository.fetchSubscriptionByParams(
      {
        ...params,
        limit,
        skip,
        sort,
        ...user,
      },
    )

    if (subscription.length < 1)
      return { success: false, msg: subscriptionMessages.NOT_FOUND, data: [] }

    return {
      success: true,
      msg: subscriptionMessages.FETCH_SUCCESS,
      data: subscription,
    }
  }

  static async updateSubscriptionService(
    subscriptionId: any,
    data: Partial<ISubscription>,
  ) {
    const subscription = await SubscriptionRepository.updateSubscriptionDetails(
      { _id: new mongoose.Types.ObjectId(subscriptionId) },
      {
        $set: {
          ...data,
        },
      },
    )

    if (!subscription)
      return { success: false, msg: subscriptionMessages.UPDATE_ERROR }

    return {
      success: true,
      msg: subscriptionMessages.UPDATE_SUCCESS,
      data: subscription,
    }
  }
}
