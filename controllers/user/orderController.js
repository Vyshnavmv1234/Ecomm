import StatusCodes from '../../utitls/statusCodes.js';
import ErrorMessages from '../../utitls/errorMessages.js';
import Cart from "../../models/cartSchema.js"
import Address from "../../models/addressSchema.js"
import Order from "../../models/orderSchema.js"
import Product from "../../models/productSchema.js"
import Coupon from "../../models/couponSchema.js"
import User from "../../models/userSchema.js"
import STATUS_CODES from "../../utitls/statusCodes.js"
import moment from "moment"
import Wallet from "../../models/walletSchema.js"


const orderSuccess = async (req,res)=>{
  try {
    const user = req.session.user
    const orderId = req.params.id
    const cart = await Cart.findOne({userId:user}).populate("items.productId")
    const userData = await User.findById(user)
    const order = await Order.find({_id:orderId})
    const orderID = await Order.findById(orderId)
    const couponCode = req.session.appliedCoupon
    const coupon = await Coupon.findOne({code:couponCode})

    if(coupon){
      
      if(!coupon.userId.includes(user)){
        coupon.userId.push(user)
        coupon.usedCount+=1
        await coupon.save()
      }
    }
    
      for(const item of order[0].orderItems){
        await Product.updateOne({_id : item.product,"variants._id" : item.variant},{$inc:{"variants.$.stock" : -item.quantity}})
      }
      await cart?.deleteOne({userId:user})
      return res.render("user/orderSuccess",{user:userData,orderId,orderID})
    
    
  } catch (error) {
    console.error("Error loading orderPage",error)
    return res.redirect("/user/pageNotFound")
  }
}

const placeOrder = async (req, res) => {
  try {

    const generateOrderId = () => {
    const now = new Date();

    const datePart = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomPart = "";

    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `ORD-${datePart}-${randomPart}`;
  };

    const userId = req.session.user;
    const {paymentMethod,address,gst,total,status} = req.body;

    const couponId = req.session.appliedCoupon;
    const wallet = await Wallet.findOne({ userId });

    const coupon = couponId? await Coupon.findById(couponId): null;
    const cart = await Cart.findOne({ userId }).populate("items.productId");


    if(coupon?.isActive == false){
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false,message: ErrorMessages.COUPON_IS_BLOCKED_BY_ADMIN})
    }

    if (!cart || cart.items.length === 0)
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false });

    const orderSummary = calculateTotal(cart);

    if (!address) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success:false,
        message: ErrorMessages.ADDRESS_REQUIRED
      });
    }

    const gstValue = Number(gst);
    const totalValue = Number(total);

    if (paymentMethod === "WALLET") {

      if (!wallet || wallet.balance < totalValue) {
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success:false,
          message: ErrorMessages.INSUFFICIENT_BALANCE
        });
      }
    }

    if (coupon) {

      if (coupon.usedCount >= coupon.usageLimit) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: ErrorMessages.COUPON_USAGE_LIMIT_REACHED
        });
      }

      await Coupon.findByIdAndUpdate(
        couponId,
        {
          $addToSet:{ userId },
          $inc:{ usedCount:1 }
        }
      );
    }

    // ORDER CALCULATION

    const subTotal = orderSummary.subTotal;
    const productDiscount = orderSummary.totalDiscount;

    const discountBase =
      subTotal - productDiscount;

    const couponAmount =
      subTotal + gstValue -
      productDiscount -
      totalValue;

    const taxableAmount =
      discountBase - couponAmount;


    const orderItems = cart.items.map(item => {

      const itemTotal = item.unitPrice * item.quantity;

      // Coupon Share
      let itemCouponShare = 0;

      if (couponAmount > 0 && discountBase > 0) {
        const couponRatio = couponAmount / discountBase;

        itemCouponShare = itemTotal * couponRatio;
      }

      // GST Share
      let itemGST = 0;

      if (taxableAmount > 0) {
        const gstRatio = gstValue / taxableAmount;

        itemGST = (itemTotal - itemCouponShare) * gstRatio;
      }

      const finalPaidAmount = Math.round(itemTotal -itemCouponShare +itemGST);

      return {
        product: item.productId._id,
        category: item.productId.category,
        variant: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        originalPrice: item.originalPrice,
        couponShare: Math.round(itemCouponShare),
        itemGST: Math.round(itemGST),
        finalPaidAmount  
      };
    });

    if (paymentMethod === "WALLET") {

      wallet.balance -= totalValue;

      wallet.transactions.push({
        amount: totalValue,
        type: "Debit",
        description: "Paid using wallet"
      });

      await wallet.save();
    }

    const order = await Order.create({

      userId,

      orderItems,

      orderSummary:{
        subTotal,
        discount: productDiscount,
        coupon: couponAmount,
        GST: gstValue,
        total: totalValue
      },
      orderId: generateOrderId(),
      shipping_address: address,
      status:"pending",
      paymentMethod,
      paymentStatus:
        paymentMethod === "WALLET"
          ? "Paid"
          : "pending"
    });

    req.session.appliedCoupon = null;

    return res.status(StatusCodes.OK).json({
      success:true,
      orderId:order._id
    });

  } catch (error) {

    console.error("Error placing order:", error);
    return res.redirect("/user/pageNotFound");
  }
};

const calculateTotal = (cart)=>{
  try {

    let subTotal = 0
    let totalDiscount = 0 

    cart.items.forEach(item => {
      subTotal += item.originalPrice * item.quantity
      totalDiscount += (item.originalPrice - item.unitPrice) * item.quantity
    })

    return {
      subTotal,
      totalDiscount,
    }

  } catch (error) {
    console.error("Error in cart calculation",error)
    return res.redirect("/user/pageNotFound")
  }
}

const orderDetail = async (req,res)=>{
  try {
    
    const userData = await User.findById(req.session.user)
    const orderId = req.params.id
    const orderDetails = await Order.findOne({_id:orderId}).populate("orderItems.product")
    orderDetails.formattedDate = moment(orderDetails.createdAt).format("DD MMM YYYY");

    req.session.appliedCoupon = null

    orderDetails.orderItems.forEach(item => {

      if (item.product && item.variant) {

        const selectedVariant =
          item.product.variants.id(item.variant);

        item.selectedVariant = selectedVariant || null;
      }

    });
    if (orderDetails.deliveredAt) {

      const today = new Date();
      const deliveredDate = new Date(orderDetails.deliveredAt);

      const diffInDays =
        (today - deliveredDate) / (1000 * 60 * 60 * 24);

      orderDetails.returnExpired = diffInDays > 7;
    }

    return res.render("user/orderDetail",{
      user:userData,
      orderId,
      order: orderDetails,
    }) 
    
    
  } catch (error) {
    console.error("Error loading orderDetails",error)
    return res.redirect("/user/pageNotFound")
  }
}

const cancelProduct = async (req, res) => {
  try {

    const { itemId, orderId, reason, comment } = req.body;

    let wallet = await Wallet.findOne({userId:req.session.user});
    const order = await Order.findById(orderId);

    if (!order)
      return res.status(StatusCodes.NOT_FOUND).json({ success:false });

    const item = order.orderItems.id(itemId);

    if (!item || item.status === "cancelled") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success:false,
        message: ErrorMessages.ITEM_ALREADY_CANCELLED
      });
    }
    if(!wallet){
      wallet = new Wallet({
        userId:req.session.user,
        balance:0,
        transactions:[]
      })
    }

    item.status = "cancelled";
    item.cancelReason = reason;

    if (comment) {
      item.cancelComment = comment;
    }

    const refundAmount = item.finalPaidAmount;

    if(order.paymentStatus ==="Paid"){

      wallet.balance += refundAmount;

      wallet.transactions.push({
      amount: refundAmount,
      type: "Credit",
      description: "Order Item Cancellation Refund"
    });
    }

    await wallet.save();

    await Product.updateOne(
      { _id: item.product, "variants._id": item.variant },
      { $inc: { "variants.$.stock": item.quantity } }
    );

    const allCancelled = order.orderItems.every(
      i => i.status === "cancelled"
    );

    if (allCancelled) {
      order.status = "cancelled";
    }

    // get active items
   const activeItems = order.orderItems.filter(
  item => item.status !== "cancelled"
);

let subTotal = 0;
let productDiscount = 0;
let couponDiscount = 0;
let gst = 0;
let total = 0;

activeItems.forEach(item => {

  subTotal += item.originalPrice * item.quantity;

  productDiscount += (item.originalPrice - item.unitPrice) * item.quantity;

  couponDiscount += item.couponShare || 0;

  gst += item.itemGST || 0;

  total += item.finalPaidAmount;

});

order.orderSummary.subTotal = subTotal;
order.orderSummary.discount = Number(productDiscount.toFixed(2));
order.orderSummary.coupon = Number(couponDiscount.toFixed(2));
order.orderSummary.coupon = Number(couponDiscount.toFixed(2));
order.orderSummary.GST = Number(gst.toFixed(2));
order.orderSummary.total = Number(total.toFixed(2));

await order.save();

    return res.status(StatusCodes.OK).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false,
      message: ErrorMessages.SERVER_ERROR
    });
  }
};

const cancelOrder = async (req, res) => {
  try {

    const { orderId, comment, reason } = req.body;

    const order = await Order.findById(orderId);

    if (!order)
      return res.status(StatusCodes.NOT_FOUND).json({ success:false });

    let wallet = await Wallet.findOne({
      userId: order.userId
    });

    if (!wallet) {
      wallet = new Wallet({
        userId: order.userId,
        balance: 0,
        transactions: []
      });
    }

    let totalRefund = 0;

    for (const item of order.orderItems) {

      if (item.status !== "cancelled") {

        item.status = "cancelled";
        item.cancelReason = reason;
        item.cancelComment = comment;

        await Product.updateOne({
            _id: item.product,
            "variants._id": item.variant
          },
          {
            $inc: {
              "variants.$.stock": item.quantity
            }
          }
        );

        totalRefund +=
          Number(item.finalPaidAmount) || 0;
      }
    }

    if (order.paymentStatus === "Paid" && totalRefund > 0) {

      wallet.balance = Number(wallet.balance) || 0;

      wallet.balance += totalRefund;

      wallet.transactions.push({
        amount: totalRefund,
        type: "Credit",
        description: "Full Order Cancellation Refund"
      });

      await wallet.save();

      order.paymentStatus = "Refunded";
    }

    order.status = "cancelled";

    await order.save();

    return res.status(StatusCodes.OK).json({
      success:true
    });

  } catch (error) {

    console.error(
      "error cancelling order",
      error
    );

    return res.status(StatusCodes.BAD_REQUEST).json({ success: false
    });
  }
};
const orderHistory = async (req,res)=>{
  try {

    const userData = await User.findById(req.session.user)
    const limit = 9            
    const page = parseInt(req.query.page) || 1
    const skip = (page - 1) * limit

    const totalOrders = await Order.countDocuments({userId:req.session.user})

    const orderDetails = await Order.find({userId:req.session.user}).populate("orderItems.product")
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit)

    const totalPages = Math.ceil(totalOrders / limit)

    return res.render("user/orderHistory",{
      user:userData,
      orders:orderDetails,
      currentPage: page,
      totalPages
    })
    
  } catch (error) {
    console.error("orderHistory error",error)
  }
}

const requestReturn = async (req, res) => {
  try {
    const { orderId, reason } = req.body

    const order = await Order.findById(orderId)

    order.returnRequested = true
    order.returnReason = reason
    order.returnStatus = "requested"

    if(!order.deliveredAt){
      throw new Error("Order not delivered yet")
    }
    const deliveredDate = new Date(order.deliveredAt)
    const today = new Date()
    const difference = (today-deliveredDate)/(1000*60*60*24)

    if(difference>7){
      throw new Error("Return window expired")
    }

    await order.save()
    res.redirect(`/user/orderDetail/${orderId}`)

  } catch (error) {
    console.error("Return request error", error)
    res.redirect("/user/pageNotFound")
  }
}
const requestItemReturn = async (req,res)=>{
  try {
    
    const {orderItemId,reason,orderId} = req.body

    console.log(orderItemId,reason,orderId)

    const order = await Order.findById(orderId)
    const item = order.orderItems.id(orderItemId)

    item.returnRequested = true
    item.returnReason = reason
    item.returnStatus = "requested"

    await order.save()
    res.redirect(`/user/orderDetail/${orderId}`)

    console.log(item)

  } catch (error) {
    console.error("Return request error", error)
    res.redirect("/user/pageNotFound")
  }
}

export default {placeOrder,orderSuccess,orderDetail,cancelProduct,cancelOrder,orderHistory,requestReturn,requestItemReturn}