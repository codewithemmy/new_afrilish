import mongoose from "mongoose"
import { IResponse } from "../../constants"
import {
  AlphaNumeric,
  hashPassword,
  queryConstructor,
  verifyPassword,
} from "../../utils"
import SubscriptionRepository from "./subscription.repository"
import { subscriptionMessages } from "./subscription.messages"
import { sendMailNotification } from "../../utils/email"
import { generalMessages } from "../../core/messages"
import { ISubscription } from "./subscription.interface"

export default class SubscriptionService {
  static async createSubscription(
    subscriptionPayload: Partial<ISubscription>,
  ): Promise<IResponse> {
    const { startDate, endDate, userId } = subscriptionPayload

    const exist = await SubscriptionRepository.fetchSubscription(
      { startDate, endDate, userId: new mongoose.Types.ObjectId(userId) },
      {},
    )

    if (exist)
      return { success: false, msg: subscriptionMessages.EXISTING_SUBSCRIPTION }

    const subscription =
      await SubscriptionRepository.createSubscription(subscriptionPayload)

    if (!subscription)
      return { success: false, msg: subscriptionMessages.SUBSCRIPTION_FAILURE }

    return {
      success: true,
      msg: subscriptionMessages.SUBSCRIPTION_SUCCESS,
      data: subscription,
    }
  }

  static async fetchMenuService(subscriptionPayload: Partial<ISubscription>) {
    const { error, params, limit, skip, sort } = queryConstructor(
      subscriptionPayload,
      "createdAt",
      "Menu",
    )

    if (error) return { success: false, msg: error }

    const menu = await SubscriptionRepository.fetchMenuByParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (menu.length < 1)
      return { success: false, msg: subscriptionMessages.NOT_FOUND, data: [] }

    return {
      success: true,
      msg: subscriptionMessages.FETCH_SUCCESS,
      data: menu,
    }
  }

  static async updateMenuService(menuId: any, data: Partial<ISubscription>) {
    // ensure password is not updated here
    const partner = await SubscriptionRepository.updateMenuDetails(
      { _id: new mongoose.Types.ObjectId(menuId) },
      {
        $set: {
          ...data,
        },
      },
    )

    if (!partner)
      return { success: false, msg: subscriptionMessages.UPDATE_ERROR }

    return { success: true, msg: subscriptionMessages.UPDATE_SUCCESS }
  }

  // static async restaurantUpdateService(data: {
  //   params: { partnerId: string }
  //   subscriptionPayload: Partial<ISubscription>
  // }) {
  //   const { params, subscriptionPayload } = data
  //   // ensure password is not updated here
  //   const { password, ...restOfPayload } = subscriptionPayload

  //   const partner = await SubscriptionRepository.updatePartnerDetails(
  //     { _id: new mongoose.Types.ObjectId(params.partnerId) },
  //     {
  //       $push: { restaurant: { ...restOfPayload } },
  //     },
  //   )

  //   if (!partner) return { success: false, msg: subscriptionMessages.UPDATE_ERROR }

  //   return { success: true, msg: subscriptionMessages.UPDATE_SUCCESS }
  // }

  // static async operationUpdateService(data: {
  //   params: { partnerId: string }
  //   subscriptionPayload: Partial<ISubscription>
  // }) {
  //   const { params, subscriptionPayload } = data
  //   // ensure password is not updated here
  //   const { password, ...restOfPayload } = subscriptionPayload

  //   const partner = await SubscriptionRepository.updatePartnerDetails(
  //     { _id: new mongoose.Types.ObjectId(params.partnerId) },
  //     {
  //       $push: { operations: { ...restOfPayload } },
  //     },
  //   )

  //   if (!partner) return { success: false, msg: subscriptionMessages.UPDATE_ERROR }

  //   return { success: true, msg: subscriptionMessages.UPDATE_SUCCESS }
  // }

  // private static async updatePassword(password: string, id: string) {
  //   const hashedPassword = await hashPassword(password)

  //   return SubscriptionRepository.updatePartnerDetails(
  //     {
  //       _id: new mongoose.Types.ObjectId(id),
  //     },
  //     {
  //       $set: {
  //         password: hashedPassword,
  //       },
  //     },
  //   )
  // }

  // static async resetPassword(data: {
  //   params: { partnerId: string }
  //   payload: { oldPassword: string; newPassword: string }
  // }) {
  //   const { params, payload } = data

  //   const partner = await SubscriptionRepository.fetchPartner(
  //     {
  //       _id: new mongoose.Types.ObjectId(params.partnerId),
  //     },
  //     {
  //       password: 1,
  //     },
  //   )

  //   if (!partner) return { success: false, msg: subscriptionMessages.FETCH_ERROR }

  //   const passwordCheck = await verifyPassword(
  //     payload.oldPassword,
  //     partner.password!,
  //   )

  //   if (!passwordCheck)
  //     return { success: false, msg: subscriptionMessages.INCORRECT_PASSWORD }

  //   const updatePassword = await this.updatePassword(
  //     payload.newPassword,
  //     params.partnerId,
  //   )

  //   if (!updatePassword)
  //     return { success: false, msg: partnerMessages.PASSWORD_RESET_ERROR }

  //   return { success: true, msg: partnerMessages.PASSWORD_RESET_SUCCESS }
  // }

  // static async deletePartnerService(data: { params: { partnerId: string } }) {
  //   const { params } = data

  //   const partner = await SubscriptionRepository.updatePartnerDetails(
  //     { _id: new mongoose.Types.ObjectId(params.partnerId) },
  //     {
  //       $set: {
  //         isDelete: true,
  //       },
  //     },
  //   )

  //   if (!partner) return { success: false, msg: partnerMessages.DELETE_FAILURE }

  //   return { success: true, msg: partnerMessages.PARTNER_DELETE }
  // }

  // static async fetchSinglePartnerService(data: any) {
  //   const partner = await SubscriptionRepository.fetchPartner(
  //     {
  //       _id: new mongoose.Types.ObjectId(data),
  //     },
  //     {},
  //   )

  //   if (!partner) return { success: false, msg: partnerMessages.FETCH_ERROR }

  //   return { success: true, msg: partnerMessages.FETCH_SUCCESS, partner }
  // }
}
