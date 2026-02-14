import Order from "../../models/orderSchema.js"
import User from "../../models/userSchema.js"
import mongoose from "mongoose"

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
      returnRequested: true,
      returnStatus: "requested"
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
const updateStatus = async(req,res)=>{
  try {
    const status = req.body.status
    const orderId = req.body.orderId

    if (!orderId || !status) {
      return res.redirect("/admin/pageNotFound")
    }

   await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    )
    if (status === "delivered") {

  const order = await Order.findById(orderId);

  if (order.paymentMethod === "COD") {
    await Order.updateOne(
      { _id: orderId },
      { $set: { paymentStatus: "Paid" } }
    );
  }
}
    return res.redirect(`/admin/editOrder/${orderId}`)
    
  } catch (error) { 
    console.error("Update status error:", error)
    return res.redirect("/admin/pageNotFound")
  }
}

const handleReturn = async (req, res) => {
  try {
    const { orderId, action } = req.body;

    if (action === "approve") {
      await Order.findByIdAndUpdate(orderId, {
        returnStatus: "approved",
        status: "returned"
      });
    }

    if (action === "reject") {
      await Order.findByIdAndUpdate(orderId, {
        returnStatus: "rejected",
        returnRequested: false
      });
    }

    res.redirect("/admin/order");
  } catch (error) {
    console.log(error);
  }
};


export default {order,editOrder,updateStatus,handleReturn}