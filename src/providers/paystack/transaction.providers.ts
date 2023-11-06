import { IPaymentResponse } from "../../files/transaction/transaction.interface"

export interface IPaymentProvider {
  initiatePayment: (payload: {
    amount: number
    email: string
  }) => Promise<IPaymentResponse>

  verifyCardPayment: (
    payload: Record<string, string>
  ) => Promise<IPaymentResponse>

  verifyProviderPayment: (reference: string) => Promise<IPaymentResponse>
}
