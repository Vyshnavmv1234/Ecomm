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

    let {code,discountValue,minOrderAmount,expireDate,usageLimit} = req.body
    let coupon = await Coupon.findOne({code})

    discountValue = Number(discountValue);
    minOrderAmount = Number(minOrderAmount);

    if(discountValue >= minOrderAmount/2){
      return res.status(400).json({
        success:false,
        message:
        "Discount must be less than twice minimum order"
      });
    }

    if(coupon){
    return res.status(400).json({success:false,message:"Coupon already exists"});
  }
    coupon = await Coupon.create({
      code,
      discountValue,
      expireDate,
      usageLimit:Number(usageLimit)||1,
      minOrderAmount,
      usageLimit,
      userId: [],
    })

    return res.json({success:true,message:"Coupon created successfully"});
    
  } catch (error) {
    console.error("Error while creating coupon",error)
  }
}

const disableCoupon = async (req,res)=>{
  try {

    const couponId = req.params.id

    await Coupon.updateOne({_id:couponId},{$set:{isActive:false}})
    return res.json({success:true,message:"Coupon disabled"})
    
  } catch (error) {
    console.error("Error while creating coupon",error)
  }
}
const enableCoupon = async (req,res)=>{
  try {

    const couponId = req.params.id

    await Coupon.updateOne({_id:couponId},{$set:{isActive:true}})
    return res.json({success:true,message:"Coupon enabled"})
    
  } catch (error) {
    console.error("Error while creating coupon",error)
  }
}

const updateCoupon = async (req,res)=>{
  try {

    const id = req.params.id
    let {code,discountValue,minOrderAmount} = req.body;
    
    const existingCoupon = await Coupon.findOne({
    code: code.toUpperCase(),
    _id: { $ne: req.params.id }  
  });

  if(existingCoupon){
    return res.json({
      success:false,
      message:"Coupon already exists"
    });
  }
    
    discountValue = Number(discountValue);
    minOrderAmount = Number(minOrderAmount);

    if(discountValue >= minOrderAmount/2){
      return res.status(400).json({
        success:false,
        message:
        "Discount must be less than twice minimum order"
      });
    }
    
    await Coupon.findByIdAndUpdate(id,req.body)

    return res.json({success:true})

    
  } catch (error) {
    console.error("Error while creating coupon",error)
  }
}
export default {loadCoupons,createCoupon,disableCoupon,enableCoupon,updateCoupon}