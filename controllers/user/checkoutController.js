import Address from "../../models/addressSchema.js"
import Cart from "../../models/cartSchema.js"
import User from "../../models/userSchema.js"
import STATUS_CODES from "../../utitls/statusCodes.js"
import Category from "../../models/categorySchema.js"

import Razorpay from "razorpay"
import crypto from "crypto"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const loadCheckout = async (req,res)=>{
  try {
    const userId = req.session.user
    const userData = await User.findById(userId)
    const userAddress = await Address.findOne({"address.isDefault":true},{"address.$":1})
    const addresses = await Address.findOne({user_id:userId})
    const cart = await Cart.findOne({userId}).populate("items.productId")

    const orderSummary = calculateTotal(cart)
    console.log(orderSummary)

    if (!cart || cart.items.length === 0) {
      return res.redirect("/user/cart");
    }

    if(orderSummary.grandTotal>0){
      return res.render("user/checkout",{
      user:userData,
      cartItems: cart?cart.items:[],
      defaultAddress:userAddress,
      allAddress:addresses?.address||[],
      subTotal:orderSummary.subTotal,
      discount:orderSummary.totalDiscount,
      gst:orderSummary.gstAmount,
      total:orderSummary.grandTotal
    })
    }else{
      return res.redirect("/user/pageNotFound")
    }
    
  } catch (error) {
    console.error("Error in loading checkout",error)
    return res.redirect("/user/pageNotFound")
  }
}
const postCheckout = async (req,res)=>{
  try {
    const userId = req.session.user
    const cart = await Cart.findOne({userId})
    .populate({
      path: "items.productId",
     populate: {
      path: "category"
  }
})
    const blockedItem = cart.items.find(item => item.productId.isBlocked);

    if (blockedItem) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({success:false,message:"One or more items in your cart are unavailable"})
    }
    const blockedCategoryItem = cart.items.find(item=> item.productId.category?.isBlocked)

    if(blockedCategoryItem){
      return res.status(STATUS_CODES.FORBIDDEN).json({success:false,message:"One or more items category is unavailable"})
    }

    const outOfStockItem = cart.items.find(item => {
      const variant = item.productId.variants.find(
        v => v._id.toString() === item.variantId.toString()
      );

      return !variant || variant.stock < item.quantity;
    });

    if (outOfStockItem) {
      return res.status(STATUS_CODES.NOT_FOUND).json({success:false,message:"One or more item is out of stock"})
    }

    return res.status(STATUS_CODES.OK).json({
      success:true
    })
    
  } catch (error) {
    console.error("Error in chekout",error)
    return res.redirect("/user/pageNotFound")
  }
}
const calculateTotal = (cart)=>{
  try {

    let subTotal = 0
    let totalDiscount = 0 

    cart.items.forEach(item => {
      subTotal += item.originalPrice * item.quantity
      totalDiscount += (item.originalPrice - item.unitPrice) * item.quantity
    })
    const taxableAmount = subTotal - totalDiscount
    const gstAmount = Math.round(taxableAmount * (5 / 100))

    const grandTotal = taxableAmount + gstAmount
    

    return {
      subTotal,
      totalDiscount,
      gstAmount,
      grandTotal
    }

  } catch (error) {
    console.error("Error in cart calculation",error)
    return res.redirect("/user/pageNotFound")
  }
}
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (error) {
    console.log(error);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }

  } catch (error) {
    console.log(error);
  }
};


export default{loadCheckout,postCheckout,verifyPayment,createRazorpayOrder}