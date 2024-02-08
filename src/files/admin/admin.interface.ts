export interface IAdmin {
  _id?: any
  firstName: string
  lastName: string
  email: string
  image: string
  password: string
  type: string
  isDeleted: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface IAdminLogin
  extends Pick<IAdmin, "_id" | "email" | "password"> {}

export interface IAdminResetPasswordPayload {
  email: string
  newPassword: string
  currentPassword: string
  confirmPassword: string
}
