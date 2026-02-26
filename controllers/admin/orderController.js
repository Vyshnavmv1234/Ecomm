import Order from "../../models/orderSchema.js"
import User from "../../models/userSchema.js"
import mongoose from "mongoose"
import Wallet from "../../models/walletSchema.js"
import Product from "../../models/productSchema.js"

const order = async (req,res)=>{
  try {
    
    const admin = await User.findOne({isAdmin:true})
    const limit = 3              
    const page = parseInt(req.query.page) || 1
    const skip = (page - 1) * limit
    const search = req.query.search || ""
    const status = req.query.status || ""

    let query = {} 

    if (status) {
      query.status = status
    }
    
    if (search && mongoose.Types.ObjectId.isValid(search)) {
      query = { _id: search }
    }
    
    const totalOrders = await Order.countDocuments(query)

     const returnOrders = await Order.find({
      $or: [
        { returnStatus: "requested" },
        { orderItems: { $elemMatch: { returnStatus: "requested" } } }
      ]
    });
    
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

    const currentStatus = order.status;

    const statusFlow = {
      pending: 1,
      shipped: 2,
      "out for delivery": 3,
      cancelled: 4,
      delivered: 5,
    };

    if(currentStatus == "delivered" || currentStatus == "cancelled"){
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

          const updatedOrder = await Order.findById(orderId)

          let newSubTotal = 0;
          let newDiscount = 0;

          updatedOrder.orderItems.forEach(i => {
            if (i.status !== "returned") {
              const itemSubTotal = i.originalPrice * i.quantity;
              const itemDiscount =
                (i.originalPrice - i.unitPrice) * i.quantity;

              newSubTotal += itemSubTotal;
              newDiscount += itemDiscount;
            }
          });

          const newGST = Math.round((newSubTotal - newDiscount) * 0.05); 
          const newTotal = newSubTotal - newDiscount + newGST;

          updatedOrder.orderSummary.subTotal = newSubTotal;
          updatedOrder.orderSummary.discount = newDiscount;
          updatedOrder.orderSummary.GST = newGST;
          updatedOrder.orderSummary.total = newTotal;

          await updatedOrder.save()
      }
      if (action === "reject") {
        await Order.updateOne(
          { _id: orderId, "orderItems._id": itemId },
          {
            $set: {
              "orderItems.$.returnStatus": "rejected",
              "orderItems.$.returnRequested": true
            }
          }
        );
      }
    }
    else{
      
      const order = await Order.findById(orderId)
    if (action === "approve") {
      await Order.findByIdAndUpdate(orderId, {
        returnStatus: "approved",
        status: "returned"
      });

      for (let item of order.orderItems) {
          await Product.updateOne(
            { _id: item.product, "variants._id": item.variant },
            { $inc: { "variants.$.stock": item.quantity } }
          );
        }

      let wallet = await Wallet.findOne({userId:req.session.user})

      if(!wallet){
        wallet = new Wallet({
          userId: order.userId,
          balance:0,
          transactions:[]
        })
      }

      wallet.balance += order.orderSummary.total
      wallet.transactions.push({
      amount: order.orderSummary.total,
      type: "credit",
      description: "Product return"
    })
    await wallet.save()
    }

    if (action === "reject") {
      await Order.findByIdAndUpdate(orderId, {
        returnStatus: "rejected",
        returnRequested: true
      });
    }
  }
      const updatedOrder = await Order.findById(orderId);

      const allReturned = updatedOrder.orderItems.every(
        item => item.status === "returned"
      );

      if (allReturned) {
        await Order.findByIdAndUpdate(orderId, {
          status: "returned"
        });
      }

    res.redirect("/admin/order");
  } catch (error) {
    console.log(error);
  }
};


export default {order,editOrder,updateStatus,handleReturn}