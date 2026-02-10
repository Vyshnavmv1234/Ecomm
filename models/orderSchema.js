import mongoose from "mongoose";
const {Schema} = mongoose

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  orderItems: [{
    
    product: {
      type: Schema.Types.ObjectId,
      ref:"Product",
      required: true
    },
    variant: {
      type: Schema.Types.ObjectId,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unitPrice: {
      type: Number,
      default: 0,
      required: true
    },
    originalPrice: {
      type: Number,
      default: 0,
      required: true
    },
    status: {
      type: String,
      default: "placed", 
    },
    returnRequested: {
      type: Boolean,
      default: false
    },
    returnReason: String,
    returnStatus: {
      type: String,
      enum: ["requested", "approved", "rejected"],
    }
  }],
  orderSummary: {
    subTotal:{
      type: Number,
      required: true
    },
    discount:{
      type: Number,
      required: true
    },
    total:{
      type: Number,
      required: true
    }
  },
  shipping_address: {
    name: String,
    phone: String,
    house: String,
    streetName: String,
    city: String,
    state: String,
    pincode: String
  },
  invoice_date: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ["COD","pending","processing","shipped","delivered","cancelled","return request","returned"]
  },
  returnRequested: {
      type: Boolean,
      default: false
    },
    returnReason: String,
    returnStatus: {
      type: String,
      enum: ["requested", "approved", "rejected"],
    },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  couponApplied: {
    type: Boolean,
    default: false
  }
})

const order = mongoose.model("Order",orderSchema)
export default order