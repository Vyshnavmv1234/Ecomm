import mongoose from "mongoose"
const {Schema}= mongoose

const couponSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  expireDate: {
    type: Date,
    required: true
  },
  offerPrice: {
    type: Number,
    required: true
  },
  minimumPrice: {
    type: Number,
    required: true
  },
  user_id: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }]
})
const coupon = mongoose.model("Coupon",couponSchema)
export default coupon