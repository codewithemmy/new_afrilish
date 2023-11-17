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
  orderId: any
  channel: "stripe"
  status: transactionStatus
  metaData?: string
  createdAt?: Date
  updatedAt?: Date
}

export type transactionStatus =
  | "Pending"
  | "Canceled"
  | "Succeeded"
  | "Failed"
  | { $in: Record<string, any> }
