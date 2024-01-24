export interface IPaymentResponse {
  success: boolean
  msg: string
  data?: any
}

export interface ITransaction {
  _id?: any
  userId: any
  order: any
  vendorId: any
  amount: Number
  currency: string
  transactionId: string
  paymentFor: string
  type: "wallet" | "order"
  channel: "stripe" | "afrilish"
  status: transactionStatus
  metaData?: string
  createdAt?: Date
  updatedAt?: Date
}

export type transactionStatus =
  | "pending"
  | "canceled"
  | "completed"
  | "failed"
  | { $in: Record<string, any> }
