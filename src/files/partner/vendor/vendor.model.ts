import mongoose, { Schema, model } from "mongoose"
import { IVendor } from "../partner.interface"

const VendorSchema = new Schema<IVendor>(
  {
    name: String,
    email: String,
    address: String,
    price: String,
    location: String,
    vendorType: String,
    payment: { bank: String, account: Number, name: String },
    updated: { type: Boolean, default: false },
    locationCoord: {
      type: { type: String },
      coordinates: [],
    },
    vendorOperations: {
      operation: [{ day: String, openingTime: String, closingTime: String }],
      orderAmount: Number,
      tags: String,
      updated: { type: Boolean, default: false },
    },
    phone: String,
    image: String,
    rating: Number,
    isAvailable: { type: Boolean, default: true },
    partnerId: { type: mongoose.Types.ObjectId, ref: "Partner" },
  },
  { timestamps: true },
)

VendorSchema.index({ locationCoord: "2dsphere" })

const vendor = model<IVendor>("Vendor", VendorSchema, "vendor")

export default vendor
