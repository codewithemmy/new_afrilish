export interface IPaymentResponse {
  success: boolean
  msg: string
  data?: any
}

export interface ITransaction {
  _id?: any
  userId: any
  vendorId: any
  amount: Number
  currency: string
  transactionId: string
  paymentFor: string
  type: "wallet" | "order"
  orderId: any
  channel: "stripe"
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
