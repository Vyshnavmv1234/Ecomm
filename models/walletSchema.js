import mongoose from "mongoose"
const {Schema} = mongoose

const walletSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  transactions: [
    {
      amount: Number,
      type: { type: String }, 
      description: String,
      date: { type: Date, default: Date.now }
    }
  ]
})

const wallet = mongoose.model("wallet",walletSchema)
export default wallet