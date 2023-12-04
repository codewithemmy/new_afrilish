import Stripe from "stripe"
import { transactionMessages } from "../files/transactions/transaction.messages"
const stripeKey = process.env.STRIPE_KEY

if (!stripeKey) {
  throw new Error("Stripe key is not defined")
}

const stripe = new Stripe(stripeKey)

const stripePaymentIntent = async (payload: {
  amount: number
  currency: any
}) => {
  const { amount, currency } = payload

  if (!amount && !currency)
    return { success: false, msg: transactionMessages.AMOUNT_CURRENCY }

  const paymentIntent = await stripe.paymentIntents.create({ amount, currency })

  return {
    success: true,
    msg: transactionMessages.PAYMENT_SUCCESS,
    data: {
      clientSecret: paymentIntent.client_secret,
      transactionId: paymentIntent.id,
    },
  }
}

export { stripePaymentIntent }
