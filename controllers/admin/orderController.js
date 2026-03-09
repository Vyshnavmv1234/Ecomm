import Order from "../../models/orderSchema.js"
import User from "../../models/userSchema.js"
import mongoose from "mongoose"
import Wallet from "../../models/walletSchema.js"
import Product from "../../models/productSchema.js"

const order = async (req,res)=>{
  try {
    
    const admin = await User.findOne({isAdmin:true})
    const limit = 9             
    const page = parseInt(req.query.page) || 1
    const skip = (page - 1) * limit
    const search = req.query.search || ""
    const status = req.query.status || ""

    let query = {}

if (status) {
  query.status = status
}

if (search) {
  if (mongoose.Types.ObjectId.isValid(search)) {
    query._id = new mongoose.Types.ObjectId(search)
  }
}
    
    const totalOrders = await Order.countDocuments(query)

     const returnOrders = await Order.find({
      $or: [
        { returnStatus: "requested" },
        { "orderItems.returnStatus": "requested" }
      ]
    }).populate("userId");
    
    const ordersData = await Order.find(query)
      .populate("orderItems.product")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalPages = Math.ceil(totalOrders / limit)  

    return res.render("admin/orderManagement",{
      admin:admin.name,
      orders:ordersData,
      currentPage: page,
      totalPages,
      search,
      returnOrders,
      selectedStatus: status
    })
    
  } catch (error) {
    console.error("Error loading order",error)
  }
}

const editOrder = async (req,res)=>{
  try {

    const orderId = req.params.id
    const admin = await User.findOne({isAdmin:true})
    const order = await Order.findById(orderId).populate("orderItems.product")

    if (!order) {
      return res.redirect("/admin/pageNotFound")
    }

      return res.render("admin/editOrder",{admin:admin.name,order})
    
    
  } catch (error) { 
    
  }
} 
const updateStatus = async (req, res) => {
  try {

    const { status, orderId } = req.body;

    if (!orderId || !status) {
      return res.json({
        success: false,
        message: "Invalid request"
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.json({
        success: false,
        message: "Order not found"
      });
    }

    for(let val of order.orderItems){
      if(val.status!=="delivered" && val.status!=="cancelled"){
        val.status = status
      }
    }

    const currentStatus = order.status;

    const statusFlow = {
      pending: 1,
      shipped: 2,
      "out for delivery": 3,
      cancelled: 4,
      delivered: 5,
    };

    if(currentStatus == "delivered" || currentStatus == "cancelled"|| currentStatus == "returned"){
      return res.json({
        success: false,
        message: "Cannot rollback order status"
      });
    }

    if (statusFlow[status] < statusFlow[currentStatus]) {
      return res.json({
        success: false,
        message: "Cannot rollback order status"
      });
    }

    order.status = status;

    if(order.status =="delivered"){
      order.deliveredAt = new Date()
    }

    if (
      status === "delivered" &&
      order.paymentMethod === "COD"
    ) {
      order.paymentStatus = "Paid";
    }

    await order.save();

    return res.json({
      success: true,
      message: "Order status updated",
      status: order.status
    });

  } catch (error) {

    console.error("Update status error:", error);

    return res.json({
      success: false,
      message: "Server error"
    });
  }
};

const handleReturn = async (req, res) => {
  try {
    const { orderId, action ,itemId} = req.body;
    const order = await Order.findById(orderId)
    const item =  order.orderItems.id(itemId)

    if(itemId){

      if(action == "approve"){
        await Order.updateOne({_id:orderId,"orderItems._id":itemId},{
          $set:{
           "orderItems.$.returnStatus": "approved",
           "orderItems.$.returnRequested": false,
           "orderItems.$.status": "returned"
          }})
      
          await Product.updateOne({_id:item.product,"variants._id":item.variant},{$inc:{"variants.$.stock":item.quantity}})

          let wallet = await Wallet.findOne({userId: order.userId});

        if(!wallet) {
          wallet = new Wallet({
            userId: order.userId,
            balance: 0,
            transactions: []
          });
        }

        const refundAmount = item.finalPaidAmount

        if(order.paymentStatus ==="Paid"){

          wallet.balance += refundAmount;

          wallet.transactions.push({
          amount: refundAmount,
          type: "credit",
          description: "Returned Item Refund"
        });
        }

          await wallet.save();

      }
      if (action === "reject") {
        await Order.updateOne(
          { _id: orderId, "orderItems._id": itemId },
          {
            $set: {
              "orderItems.$.returnStatus": "rejected",
              "orderItems.$.returnRequested": false
            }
          }
        );
      }
    }
else {

  if (action === "approve") {

    await Order.updateOne({_id:orderId},{$set:{returnRequested:false,returnStatus:"approved"}})

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

      if (item.status == "delivered") {

        item.status = "returned";
        item.returnStatus = "approved";
        item.returnRequested = false;

        await Product.updateOne(
          {
            _id: item.product,
            "variants._id": item.variant
          },
          {
            $inc: {
              "variants.$.stock": item.quantity
            }
          }
        );

        totalRefund += Number(item.finalPaidAmount) || 0;
      }
    }

    if (order.paymentStatus === "Paid" && totalRefund > 0) {

      wallet.balance = Number(wallet.balance) || 0;

      wallet.balance += totalRefund;

      wallet.transactions.push({
        amount: totalRefund,
        type: "credit",
        description: "Full Order Return Refund"
      });

      await wallet.save();

      order.paymentStatus = "Refunded";
    }

    await order.save();
  }

  if (action === "reject") {
      order.returnStatus = "rejected";
      order.returnRequested = false;

      for (const item of order.orderItems) {
        item.returnStatus = "rejected";
        item.returnRequested = false;
      }

      await order.save();
  }
}
      const updatedOrder = await Order.findById(orderId);

      const allCancelled = updatedOrder.orderItems.every(
      item => item.status === "cancelled"
    );

    const allReturned = updatedOrder.orderItems.every(
      item => item.status === "returned"
    );

    const allClosed = updatedOrder.orderItems.every(
      item => ["returned", "cancelled"].includes(item.status)
    );

    if (allCancelled) {
      updatedOrder.status = "cancelled";
    }
    else if (allReturned) {
      updatedOrder.status = "returned";
    }
    else if (allClosed) {
      updatedOrder.status = "returned"; 
    }

    await updatedOrder.save();

    res.redirect("/admin/order");
  } catch (error) {
    console.log(error);
  }
};


export default {order,editOrder,updateStatus,handleReturn}