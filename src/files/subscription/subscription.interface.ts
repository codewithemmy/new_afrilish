export interface ISubscription {
  _id?: any
  startDate: Date
  endDate: Date
  monday: IMeal
  tuesday: IMeal
  wednesday: IMeal
  thursday: IMeal
  friday: IMeal
  saturday: IMeal
  sunday: IMeal
  userId: any
  status: "paused" | "active" | "pending" | "completed"
  isDelete: boolean
  createdAt?: Date
  updatedAt?: Date
}

// interface IMeal {
//   breakfast: IItemList
//   lunch: IItemList
//   dinner: IItemList
// }

// interface IItemList {
//   item: [_id: any, quantity: Number, price: Number]
// }

type IMeal = {
  breakfast: IItemList
  lunch: IItemList
  dinner: IItemList
}

// Define the MealPayload type for better TypeScript type-checking
type IItemList = {
  item: Array<{ _id: any; quantity: Number; price: Number }>
}
