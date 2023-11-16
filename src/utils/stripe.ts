import Stripe from "stripe"

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
    return { success: false, msg: `amount and currency cannot be empty` }

  const paymentIntent = await stripe.paymentIntents.create({ amount, currency })

  return {
    success: true,
    msg: `stripe payment Intent Successful`,
    data: {
      clientSecret: paymentIntent.client_secret,
      transactionId: paymentIntent.id,
    },
  }
}

export { stripePaymentIntent }
