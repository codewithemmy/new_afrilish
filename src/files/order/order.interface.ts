export interface IOrder {
  _id?: any
  pickUpCode: Number
  orderCode: Number
  orderId: string
  delivery: Boolean
  note: string
  deliveryAddress: string
  itemId: [
    {
      _id: any
      quantity: Number
      price: Number
    },
  ]
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
  scheduleId: any
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
