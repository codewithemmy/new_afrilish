import mongoose, { Schema, model } from "mongoose"

import { IVendor } from "../partner.interface"

const VendorSchema = new Schema<IVendor>(
  {
    name: { type: String },
    email: { type: String },
    address: { type: String },
    businessNumber: { type: String },
    price: { type: String },
    location: { type: String },
    wallet: { type: Number, default: 0 },
    vendorType: { type: String },
    payment: { sortCode: String, account: Number, name: String },
    updated: { type: Boolean, default: false },
    locationCoord: {
      type: { type: String },
      coordinates: [],
    },
    averageRating: { type: Number, default: 0 },
    vendorOperations: {
      operation: [{ day: String, openingTime: String, closingTime: String }],
      orderAmount: Number,
      tags: String,
      updated: { type: Boolean, default: false },
    },
    phone: { type: String },
    image: { type: String },
    rating: [
      {
        rate: Number,
        review: String,
        ratedBy: { type: mongoose.Types.ObjectId, ref: "Users" },
      },
    ],
    isAvailable: { type: Boolean, default: false },
    partnerId: { type: mongoose.Types.ObjectId, ref: "Partner" },
    itemId: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
  },
  { timestamps: true },
)

VendorSchema.index({ locationCoord: "2dsphere" })

const vendor = model<IVendor>("Vendor", VendorSchema, "vendor")

export default vendor
