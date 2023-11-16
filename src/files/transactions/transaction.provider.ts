import { IPaymentResponse } from "./transaction.interface"

export interface IPaymentProvider {
  initiatePaymentIntent: (payload: {
    amount: number
    currency: string
  }) => Promise<IPaymentResponse>
}
