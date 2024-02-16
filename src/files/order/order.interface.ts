export interface IOrder {
  _id?: any
  assignedRider: any
  pickUpCode: Number
  daysOfEvent: Number
  orderCode: Number
  orderId: string
  pickUp: Boolean
  isWallet: Boolean
  isEvent: Boolean
  isBulk: Boolean
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
      day?: Date
      date?: Date
      period?: "breakfast" | "lunch" | "dinner"
      preferredTime?: string
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
  startTime: string
  endTime: string
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
    | "delivered"
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
  eventDescription: string
  eventLocation: string
  rating: Boolean
  paymentIntentId: string
  status: "accepted" | "rejected" | "pending"
  locationCoord?: ILocation
  createdAt?: Date
  updatedAt?: Date
}

interface ILocation {
  type?: string
  coordinates?: [Number, Number]
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
