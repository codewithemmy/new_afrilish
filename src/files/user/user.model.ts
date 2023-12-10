import mongoose, { Schema, model } from "mongoose"
import { IUser } from "./user.interface"

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    image: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    language: { type: String },
    wallet: { type: Number, default: 0 },
    home: { type: String },
    office: { type: String },
    dateOfBirth: { type: Date },
    locationCoord: {
      type: { type: String },
      coordinates: [],
    },
    referralCode: String,
    loginCode: Number,
    isDelete: { type: Boolean, default: false },
    verificationOtp: String,
  },
  { timestamps: true },
)

const user = model<IUser>("User", UserSchema, "user")

export default user
