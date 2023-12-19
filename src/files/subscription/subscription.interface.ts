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

interface IMeal {
  breakfast: [any]
  launch: [any]
  dinner: [any]
}
