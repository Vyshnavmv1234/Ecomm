import mongoose from "mongoose";
const {Schema} = mongoose

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})
const category = mongoose.model("Category",categorySchema)
export default category