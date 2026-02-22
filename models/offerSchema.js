import mongoose from "mongoose";
const {Schema}= mongoose

const offerSchema = new Schema({

  title: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["product", "category", "referral"],
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },
  
  discountValue: {
    type: Number,
    required: true
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

const offer = mongoose.model("Offer",offerSchema)

export default offer