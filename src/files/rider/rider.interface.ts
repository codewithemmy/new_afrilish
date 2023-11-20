export interface IRider {
  _id?: any
  name: string
  email: string
  password: string
  phone: string
  location: string
  isVerified: Boolean
  locationCoord?: ILocation
  image: string
  wallet: Number
  serviceAvailable: Boolean
  rating?: Number
  verificationToken: string
  passwordToken: string
  resetTokenExpirationDate?: Date
  passwordTokenExpirationDate: Date
  createdAt?: Date
  updatedAt?: Date
}

interface ILocation {
  type?: string
  coordinates?: [Number, Number]
}
