import StatusCodes from '../../utitls/statusCodes.js';
import ErrorMessages from '../../utitls/errorMessages.js';
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

    const limit = 7;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    let walletDetails = [];
    let totalPages = 1;

    if (wallet && wallet.transactions.length > 0) {

      const totalItems = wallet.transactions.length;
      totalPages = Math.ceil(totalItems / limit);

      const sortedTransactions = wallet.transactions
        .slice()
        .reverse();

      walletDetails = sortedTransactions.slice(skip, skip + limit);
    }

    res.render("user/wallet", {
      user,
      wallet,
      walletDetails,
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

    res.status(StatusCodes.OK).json({ success: true, order })

  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false })
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

    res.status(StatusCodes.OK).json({ success: true });

} else {
    res.status(StatusCodes.BAD_REQUEST).json({ success: false });
}


  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false })
  }
}

export default {loadWallet,verifyWalletPayment,createWalletOrder}