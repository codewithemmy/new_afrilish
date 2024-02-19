import mongoose, { Schema, model } from "mongoose"
import cron from "node-cron"
import { IOrder } from "./order.interface"

const OrderSchema = new Schema<IOrder>(
  {
    pickUpCode: { type: Number },
    orderCode: { type: Number },
    daysOfEvent: { type: Number },
    assignedRider: { type: mongoose.Types.ObjectId, ref: "Rider" },
    orderId: { type: String },
    pickUp: { type: Boolean, default: false },
    isWallet: { type: Boolean, default: false },
    isEvent: { type: Boolean, default: false },
    isBulk: { type: Boolean, default: false },
    rating: { type: Boolean, default: false },
    deliveryAddress: { type: String },
    note: { type: String },
    itemId: [
      {
        _id: { type: mongoose.Types.ObjectId, ref: "Item" },
        quantity: { type: Number },
        price: { type: Number },
        day: { type: Date },
        date: { type: Date },
        period: { type: String },
        preferredTime: { type: String },
      },
    ],
    transactionId: [{ type: mongoose.Types.ObjectId, ref: "Transaction" }],
    scheduleId: { type: mongoose.Types.ObjectId, ref: "Subscription" },
    orderedBy: { type: mongoose.Types.ObjectId, ref: "User" },
    vendorId: { type: mongoose.Types.ObjectId, ref: "Vendor" },
    userEmail: { type: String },
    userName: { type: String },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "on-going",
        "ready",
        "in-transit",
        "arrived",
        "cancelled",
        "picked",
        "completed",
      ],
      default: "pending",
    },
    orderDate: { type: Date },
    startDate: { type: Date },
    endDate: { type: Date },
    startTime: { type: String },
    endTime: { type: String },
    schedule: { type: Boolean, default: false },
    riderStatus: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "on-going",
        "ready",
        "in-transit",
        "arrived",
        "delivered",
        "cancelled",
        "picked",
        "completed",
      ],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "rejected", "accepted"],
      default: "pending",
    },
    isDelete: { type: Boolean, default: false },
    paymentResponse: { type: String },
    ridersFee: { type: Number },
    netAmount: { type: Number },
    totalAmount: { type: Number },
    marketPlace: { type: Number },
    serviceCharge: { type: Number },
    confirmDelivery: { type: Boolean, default: false },
    remarks: { type: String },
    isConfirmed: { type: Boolean, default: false },
    delivery: { type: Boolean },
    readyTime: { type: String },
    paymentIntentId: { type: String },
    eventDescription: { type: String },
    eventLocation: { type: String },
    locationCoord: {
      type: { type: String },
      coordinates: [],
    },
  },
  { timestamps: true },
)

OrderSchema.index({ locationCoord: "2dsphere" })

const order = model<IOrder>("Order", OrderSchema, "order")


// Define a cron job to run every day at a specific time (e.g., midnight)
cron.schedule('0 0 * * *', async () => {
  try {
    // Calculate the date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Delete orders where isConfirmed is false and createdAt is before sevenDaysAgo
    const result = await order.deleteMany({
      isConfirmed: false,
      createdAt: { $lt: sevenDaysAgo },
    });

    console.log(`Deleted ${result.deletedCount} orders older than 7 days.`);
  } catch (error) {
    console.error('Error deleting orders:', error);
  }
});


export default order
