import Order from "../../models/orderSchema.js"

const order = async (req,res)=>{
  try {
    
    const order = await Order.find({})
    console.log(order)
    return res.render("admin/orderManagement",{admin:null})
    
  } catch (error) {
    
  }
}

export default {order}