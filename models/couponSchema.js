import mongoose from "mongoose"
const {Schema}= mongoose

const couponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  discountValue: {
    type: Number,
    required: true
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
  minOrderAmount: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usedCount: {
    type: Number,
    default: 0             
  },
  usageLimit: {
    type: Number
  },
  userId: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }]
})
const coupon = mongoose.model("Coupon",couponSchema)
export default coupon