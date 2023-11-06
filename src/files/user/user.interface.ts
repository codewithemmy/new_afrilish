export interface IUser {
  _id?: any
  fullName: string
  phone: string
  email: string
  language: string
  location: string
  referralCode?: string
  createdAt?: Date
  updatedAt?: Date
  isDelete: Boolean
  isVerified: Boolean
  verificationOtp: string
}
