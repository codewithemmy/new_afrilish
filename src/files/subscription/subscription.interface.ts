export interface ISubscription {
  _id?: any
  startDate: Date
  endDate: Date
  breakfast: IDays
  lunch: IDays
  dinner: IDays
  userId: any
  status: "paused" | "active" | "pending"
  isDelete: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface IDays {
  dayOne: [any]
  dayTwo: [any]
  dayThree: [any]
  dayFour: [any]
  dayFive: [any]
  daySix: [any]
  daySeven: [any]
}
