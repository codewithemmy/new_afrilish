import mongoose, { Schema, model } from "mongoose"
import { IText } from "./text.interface"

const TextSchema = new Schema<IText>(
  {
    name: { type: String },
    image: { type: String },
  },
  { timestamps: true },
)

const text = model<IText>("Text", TextSchema, "text")

export default text
