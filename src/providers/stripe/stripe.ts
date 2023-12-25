import mongoose from "mongoose"
import { IResponse } from "../../constants"
import { providerMessages } from "../providers.messages"
import { stripePaymentIntent } from "../../utils/stripe"

export default class StripePaymentService {
  async initiatePaymentIntent(paymentPayload: {
    amount: number
    currency: string
  }) {
    const { amount, currency } = paymentPayload

    const stripe = await stripePaymentIntent({ amount, currency })

    if (!stripe)
      return { success: false, msg: providerMessages.INITIATE_PAYMENT_FAILURE }

    return {
      success: true,
      msg: providerMessages.INITIATE_PAYMENT_SUCCESS,
      data: stripe,
    }
  }
}
