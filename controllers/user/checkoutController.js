import StatusCodes from '../../utitls/statusCodes.js';
import ErrorMessages from '../../utitls/errorMessages.js';
import Address from "../../models/addressSchema.js"
import Cart from "../../models/cartSchema.js"
import User from "../../models/userSchema.js"
import STATUS_CODES from "../../utitls/statusCodes.js"
import Category from "../../models/categorySchema.js"
import Order from "../../models/orderSchema.js"
import Coupons from "../../models/couponSchema.js"

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
    const userAddress = await Address.findOne({user_id:userId,"address.isDefault":true})
    const addresses = await Address.findOne({user_id:userId})
    const cart = await Cart.findOne({userId}).populate("items.productId")

    let couponCode = 0
    let couponValue = 0
    let couponDetails = ""

    if(req.session.appliedCoupon){
     couponCode = req.session.appliedCoupon
     couponDetails = await Coupons.findById(couponCode)
     couponValue = couponDetails?.discountValue ||0
     
    }    

    const orderSummary = calculateTotal(cart,couponValue)
    const total = orderSummary?.grandTotal
    const coupons = await Coupons.find({minOrderAmount:{$lte:total},isActive:true})

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
      total:orderSummary.grandTotal,
      availableCoupons:coupons,
      appliedCoupons: couponDetails
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
      return res.status(STATUS_CODES.BAD_REQUEST).json({success:false,message: ErrorMessages.ONE_OR_MORE_ITEMS_IN_YOUR_CART_ARE_UNAVAILABLE})
    }
    const blockedCategoryItem = cart.items.find(item=> item.productId.category?.isBlocked)

    if(blockedCategoryItem){
      return res.status(STATUS_CODES.FORBIDDEN).json({success:false,message: ErrorMessages.ONE_OR_MORE_ITEMS_CATEGORY_IS_UNAVAILABLE})
    }

    const outOfStockItem = cart.items.find(item => {
      const variant = item.productId.variants.find(
        v => v._id.toString() === item.variantId.toString()
      );

      return !variant || variant.stock < item.quantity;
    });

    if (outOfStockItem) {
      return res.status(STATUS_CODES.NOT_FOUND).json({success:false,message: ErrorMessages.ONE_OR_MORE_ITEM_IS_OUT_OF_STOCK})
    }

    return res.status(STATUS_CODES.OK).json({
      success:true
    })
    
  } catch (error) {
    console.error("Error in chekout",error)
    return res.redirect("/user/pageNotFound")
  }
}

const calculateTotal = (cart,couponValue =0)=>{
  try {

    let subTotal = 0
    let productDiscount = 0 

    cart?.items.forEach(item => {
      subTotal += item.originalPrice * item.quantity
      productDiscount += (item.originalPrice - item.unitPrice) * item.quantity
    })
    console.log(productDiscount)
    const amountAfterProductDiscount  = subTotal - productDiscount
    const taxableAmount = amountAfterProductDiscount - couponValue
    const gstAmount = Math.round(taxableAmount * (5 / 100))

    const grandTotal = taxableAmount + gstAmount 
    
    return {
      subTotal,
      totalDiscount:productDiscount+couponValue,
      gstAmount,
      grandTotal
    }

  } catch (error) {
    console.error("Error in cart calculation",error)

  }
}
const applyCoupon = async(req,res)=>{
  try {

    const couponCode = req.body.couponCode
    const coupon = await Coupons.findOne({code:couponCode})
    
    if(!coupon){
      return res.status(STATUS_CODES.NOT_FOUND).json({success:false,message: ErrorMessages.INVALID_COUPON})
    }
    const alreadyUsed = coupon.userId.some(i=>i.toString() === req.session.user)

    if (alreadyUsed) {
  return res.status(StatusCodes.CONFLICT).json({success:false,message: ErrorMessages.COUPON_ALREADY_USED});
}
  req.session.appliedCoupon = coupon._id
  return res.status(STATUS_CODES.OK).json({success:true,message: ErrorMessages.COUPON_APPLIED_SUCCESSFULLY})
    
  } catch (error) {
    console.error("Error while applying coupon",error)
  }
}

const removeCoupon = async (req, res) => {
  try {

    req.session.appliedCoupon = null

    return res.status(StatusCodes.OK).json({
      success: true
    })

  } catch (error) {
    console.error("Error removing coupon", error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false })
  }
}


const createRazorpayOrder = async (req, res) => {
  try {
    const { amount ,dbOrderId} = req.body;

    const options = {
      amount: Math.round(amount*100),
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    const order = await razorpay.orders.create(options);
    await Order.findByIdAndUpdate(dbOrderId, {
    razorpayOrderId: order.id
  });

    res.status(StatusCodes.OK).json(order);

  } catch (error) {
    console.log(error);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {

      await Order.findByIdAndUpdate(dbOrderId, {
        paymentStatus: "Paid",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });

      return res.status(StatusCodes.OK).json({ success: true });

    } else {

      await Order.findByIdAndUpdate(dbOrderId, {
        paymentStatus: "Failed",
        orderStatus: "Cancelled"
      });

      return res.status(StatusCodes.BAD_REQUEST).json({ success: false });
    }
  } catch (error) {
    console.log(error);
  }
};

const paymentFailed = async (req,res) =>{
  try {

    const { amount, paymentId, orderId } = req.query;
    const user = await User.findById(req.session.user)

    return res.render("user/paymentFailed",{user,total:amount,paymentId,orderId})
    
  } catch (error) {
    console.error('error occured while loading payment failure page',error)
  }
}

const updatePaymentStatus = async (req, res) => {
  try {

    const { dbOrderId, razorpayPaymentId } = req.body;

    const order = await Order.findById(dbOrderId);

    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false });
    }

    order.paymentStatus = "Paid";
    order.orderStatus = "Processing";
    order.razorpayPaymentId = razorpayPaymentId;

    await order.save();

    return res.status(StatusCodes.OK).json({ success: true });

  } catch (error) {
    console.error("Error updating payment:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false });
  }
};


export default{
  loadCheckout,
  postCheckout,
  verifyPayment,
  createRazorpayOrder,
  paymentFailed,
  updatePaymentStatus,
  applyCoupon,
  removeCoupon}