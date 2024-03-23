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
    deviceId: { type: String },
    isVerified: { type: Boolean, default: false },
    payment: [
      {
        accountName: { type: String },
        sortCode: { type: String },
        accountNumber: { type: String },
        bankName: { type: String },
        branchName: { type: String },
        phone1: { type: String },
        addressLine1: { type: String },
        addressLine2: { type: String },
        postTown: { type: String },
        stateId: { type: Number },
      },
    ],
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
    phone: { type: String },
    image: { type: String },
    rating: [
      {
        rate: Number,
        review: String,
        ratedBy: { type: mongoose.Types.ObjectId, ref: "Users" },
      },
    ],
    ratingAverage: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: false },
    partnerId: { type: mongoose.Types.ObjectId, ref: "Partner" },
    itemId: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
  },
  { timestamps: true },
)

VendorSchema.index({ locationCoord: "2dsphere" })

VendorSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate() as any
    const vendor = await this.model.findOne(this.getQuery())

    // Calculate average rating only if there are ratings
    if (vendor?.rating && vendor?.rating?.length > 0) {
      const totalRating = vendor.rating.reduce(
        (sum: number, current: any) => sum + current.rate,
        0,
      )
      update.$set = update.$set || {}
      update.$set.ratingAverage = totalRating / vendor.rating.length
    } else {
      // Set default ratingAverage if there are no ratings
      update.$set = update.$set || {}
      update.$set.ratingAverage = 0
    }

    // Call next to continue with the findOneAndUpdate operation
    next()
  } catch (error: any) {
    // Handle any errors during the calculation
    next(error)
  }
})

const vendor = model<IVendor>("Vendor", VendorSchema, "vendor")

export default vendor
