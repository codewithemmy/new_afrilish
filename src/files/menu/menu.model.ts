import mongoose, { Schema, model } from "mongoose"
import { IMenu } from "./menu.interface"

const MenuSchema = new Schema<IMenu>(
  {
    title: { type: String },
    image: { type: String },
    description: { type: String },
    outOfStock: { type: Boolean, default: false },
    vendorId: {
      type: mongoose.Types.ObjectId,
      ref: "Vendor",
    },
    isDelete: { type: Boolean, default: false },
    item: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Item",
      },
    ],
  },
  { timestamps: true },
)

const menu = model<IMenu>("Menu", MenuSchema, "menu")

export default menu
