import mongoose from "mongoose";
const {Schema} = mongoose

const productSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref:"Category",
    required: true
  },
  discount: {
    type: Number,
    required: false
  },
  quantity: {
    type: Number,
    default: true,
    required:false
  },

  images: [{
    url: String,
    public_id: String
  }],
  
  offer: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Offer",
  default: null
},
  variants: [
    {
      size: {
        type: String,
        enum: ["S", "M", "L", "XL"],
        required: true
      },
      stock: {
        type: Number,
        required: false,
        min: 0
      },
      price: {
        type: Number,
        required: true,
        min:0
      },
      finalPrice: {
      type: Number,
      default: null
    },
    }
  ],

  isBlocked: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["Available","Discontinued","Out of stock"],
    required: false,
    default: "Available"
  }
},{timestamps:true})

const product = mongoose.model("Product",productSchema)

export default product