import mongoose, { Schema, model } from "mongoose"
import { IUser } from "./user.interface"

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    image: { type: String },
    phone: { type: String },
    email: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    wallet: { type: Number, default: 0 },
    home: { type: String },
    address: { type: String },
    office: { type: String },
    dateOfBirth: { type: Date },
    locationCoord: {
      type: { type: String },
      coordinates: [],
    },
    referralCode: { type: String },
    loginCode: { type: Number },
    isDelete: { type: Boolean, default: false },
    verificationOtp: { type: String },
  },
  { timestamps: true },
)

const user = model<IUser>("User", UserSchema, "user")

export default user
