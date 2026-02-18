import mongoose from "mongoose"

const walletSchema = new mongoose.Schema({
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

export default mongoose.model("Wallet", walletSchema)
