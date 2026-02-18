import User from "../../models/userSchema.js"
import Razorpay from "razorpay"
import crypto from "crypto"
import Wallet from "../../models/walletSchema.js"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

const loadWallet = async (req, res) => {
  try {

    const userId = req.session.user;

    const user = await User.findById(userId);
    const wallet = await Wallet.findOne({ userId });

    const limit = 3;
    const page = parseInt(req.query.page) || 1;

    let transactions = [];
    let totalPages = 1;

    if (wallet && wallet.transactions.length > 0) {

      const totalItems = wallet.transactions.length;
      totalPages = Math.ceil(totalItems / limit);

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      transactions = wallet.transactions
        .slice()
        .reverse()
        .slice(startIndex, endIndex);
    }

    res.render("user/wallet", {
      user,
      wallet,
      transactions,
      currentPage: page,
      totalPages
    });

  } catch (error) {
    console.log(error);
  }
};


export const createWalletOrder = async (req, res) => {
  try {
    const { amount } = req.body

    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: "wallet_" + Date.now()
    }

    const order = await razorpay.orders.create(options)

    res.json({ success: true, order })

  } catch (error) {
    res.status(500).json({ success: false })
  }
}

const verifyWalletPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount
    } = req.body

    const body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex")

    if (expectedSignature === razorpay_signature) {

    let wallet = await Wallet.findOne({ userId: req.session.user });

    if (!wallet) {
        wallet = new Wallet({
            userId: req.session.user,
            balance: Number(amount),
            transactions: [{
                amount: Number(amount),
                type: "credit",
                description: "Wallet Top-up"
            }]
        });

        await wallet.save();
    } 
    else {
        wallet.balance += Number(amount);

        wallet.transactions.push({
            amount: Number(amount),
            type: "credit",
            description: "Wallet Top-up"
        });

        await wallet.save();
    }

    res.json({ success: true });

} else {
    res.json({ success: false });
}


  } catch (err) {
    res.status(500).json({ success: false })
  }
}

export default {loadWallet,verifyWalletPayment,createWalletOrder}