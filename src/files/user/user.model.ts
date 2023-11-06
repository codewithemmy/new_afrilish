import mongoose, { Schema, model } from "mongoose"
import { IUser } from "./user.interface"
// import { IRestaurant } from "./partner.interface"

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    language: { type: String },
    location: { type: String },
    referralCode: String,
    isDelete: { type: Boolean, default: false },
    verificationOtp: String
  },
  { timestamps: true },
)

const user = model<IUser>("User", UserSchema, "user")

export default user
