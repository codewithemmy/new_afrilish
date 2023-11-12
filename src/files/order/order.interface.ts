export interface IOrder {
  _id?: any
  pickUpCode: Number
  orderCode: Number
  item: [ICartItems]
  orderedBy: any
  vendorId: any
  totalAmount: Number
  userEmail: string
  userName: string
  paymentStatus: "paid" | "pending" | "failed"
  orderDate: Date
  paymentResponse: string
  ridersFee: Number
  netAmount: Number
  marketPlace: Number
  serviceCharge: Number
  orderStatus: "pending" | "on-going" | "completed" | "delivered" | "cancelled"
  confirmDelivery: Boolean
  remarks: string
  addNote: string
  riderStatus:
    | "pending"
    | "rejected"
    | "accepted"
    | "delivered"
    | "cancelled"
    | "picked"
    | "on-road"

  isDelete: boolean
  transactionId: any
  readyTime: string
  paymentIntentId: string
  status: "accepted" | "rejected" | "pending"
  locationCoord: ILocation
  createdAt?: Date
  updatedAt?: Date
}

interface ILocation {
  type: string
  coordinates: [Number, Number]
}

interface ICartItems {
  item: any
  quantity: Number
}
