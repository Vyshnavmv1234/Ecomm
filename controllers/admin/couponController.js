import user from "../../models/userSchema.js"
import Coupon from "../../models/couponSchema.js"

const loadCoupons = async (req,res)=>{
  try {

    const admin = await user.findOne({isAdmin:true})
    const coupon = await Coupon.find().sort({createdAt:-1})

    return res.render("admin/couponManagement",{admin:admin.name,coupons:coupon})
    
  } catch (error) {

    console.error("Error while loading coupons",error)
    
  }
}

const createCoupon = async (req,res)=>{
  try {

    const {code,discountValue,minOrderAmount,maxDiscount,expireDate,usageLimit} = req.body

    const exists = await Coupon.findOne({code})

    if(exists){
      return res.json({message:"Coupon already exists"})
    }
    const coupon = new Coupon(req.body)
    await coupon.save()

    return res.redirect("/admin/coupon/couponManagement")

    
  } catch (error) {
    console.error("Error while creating coupon",error)
  }
}

const disableCoupon = async (req,res)=>{
  try {

    const couponId = req.params.id
    console.log(couponId)

    await Coupon.updateOne({_id:couponId},{$set:{isActive:false}})
    return res.json({success:true})
    
  } catch (error) {
    console.error("Error while creating coupon",error)
  }
}
const enableCoupon = async (req,res)=>{
  try {

    const couponId = req.params.id
    console.log(couponId)

    await Coupon.updateOne({_id:couponId},{$set:{isActive:true}})
    return res.json({success:true})
    
  } catch (error) {
    console.error("Error while creating coupon",error)
  }
}

const updateCoupon = async (req,res)=>{
  try {

    const id = req.params.id
    const formData = req.body

    const existingCode = await Coupon.findOne({code:formData.code})

    if(existingCode){
      return res.json({message:"Code already exists"})
    }
    
    await Coupon.findByIdAndUpdate(id,req.body)

    return res.json({success:true})

    
  } catch (error) {
    console.error("Error while creating coupon",error)
  }
}
export default {loadCoupons,createCoupon,disableCoupon,enableCoupon,updateCoupon}