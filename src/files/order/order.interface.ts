export interface IOrder {
  _id?: any
  pickUpCode: Number
  orderCode: Number
  orderId: string
  pickUp: Boolean
  isWallet: Boolean
  isConfirmed: Boolean
  delivery: Boolean
  schedule: Boolean
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
  startDate: Date
  endDate: Date
  paymentResponse: string
  ridersFee: Number
  netAmount: Number
  marketPlace: Number
  serviceCharge: Number
  orderStatus:
    | "pending"
    | "accepted"
    | "on-going"
    | "ready"
    | "in-transit"
    | "arrived"
    | "cancelled"
    | "picked"
    | "completed"
  confirmDelivery: Boolean
  remarks: string
  riderStatus:
    | "pending"
    | "accepted"
    | "on-going"
    | "ready"
    | "in-transit"
    | "arrived"
    | "cancelled"
    | "picked"
    | "completed"

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

export type DayPayload = {
  breakfast: MealPayload
  lunch: MealPayload
  dinner: MealPayload
}

// Define the MealPayload type for better TypeScript type-checking
type MealPayload = {
  item: Array<{ _id: any; quantity: Number; price: Number }>
}
