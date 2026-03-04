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
    couponShare: {
    type: Number,
    default: 0
  },

    itemGST: {
    type: Number,
    default: 0
  },
    finalPaidAmount:{
    type:Number,
    required:true,
    default:0
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
    cancelReason: String,
    cancelComment: String,
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
    GST:{
      type: Number,
      required: true
    },
    coupon:{
      type: Number,
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
  status: {     //order status
    type: String,
    required: true,
    enum: ["pending","processing","shipped","delivered","cancelled","return request","returned","out for delivery"]
  },

  paymentMethod: {
  type: String,
  enum: ["COD", "RAZORPAY", "WALLET"],
  required: true
  },

  paymentStatus: {
  type: String,
  enum: ["pending", "Paid", "Failed", "Refunded"],
  default: "pending"
  },
  razorpayOrderId: {
  type: String
  },

  razorpayPaymentId: {
  type: String
  },

  returnRequested: {
      type: Boolean,
      default: false
    },
    returnReason: String,
    cancelReason: String,
    cancelComment: String,
    returnStatus: {
      type: String,
      enum: ["requested", "approved", "rejected"],
    },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  deliveredAt: {
    type: Date
  },
  couponApplied: {
    type: Boolean,
    default: false
  }
})

const order = mongoose.model("Order",orderSchema)
export default order