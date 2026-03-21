import StatusCodes from '../../utitls/statusCodes.js';
import ErrorMessages from '../../utitls/errorMessages.js';
import user from "../../models/userSchema.js"
import Coupon from "../../models/couponSchema.js"

const loadCoupons = async (req, res) => {
  try {

    const admin = await user.findOne({ isAdmin: true });

    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    const searchQuery = {
      code: { $regex: search, $options: "i" }
    };

    const coupons = await Coupon.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCoupons = await Coupon.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalCoupons / limit);

    res.render("admin/couponManagement", {
      admin: admin.name,
      coupons,
      currentPage: page,
      totalPages,
      search
    });

  } catch (error) {
    console.error("Error while loading coupons", error);
  }
};

const createCoupon = async (req,res)=>{
  try {

    let {code,discountValue,minOrderAmount,expireDate,usageLimit} = req.body
    let coupon = await Coupon.findOne({code})

    discountValue = Number(discountValue);
    minOrderAmount = Number(minOrderAmount);

    if(discountValue >= minOrderAmount/2){
      return res.status(StatusCodes.BAD_REQUEST).json({
        success:false,
        message: ErrorMessages.DISCOUNT_MUST_BE_LESS_THAN_TWICE_MINIMUM_ORDER
      });
    }

    if(coupon){
    return res.status(StatusCodes.BAD_REQUEST).json({success:false,message: ErrorMessages.COUPON_ALREADY_EXISTS});
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

    return res.status(StatusCodes.OK).json({ success: true,message: ErrorMessages.COUPON_CREATED_SUCCESSFULLY});
    
  } catch (error) {
    console.error("Error while creating coupon",error)
  }
}

const disableCoupon = async (req,res)=>{
  try {

    const couponId = req.params.id

    await Coupon.updateOne({_id:couponId},{$set:{isActive:false}})
    return res.status(StatusCodes.OK).json({ success: true,message: ErrorMessages.COUPON_DISABLED})
    
  } catch (error) {
    console.error("Error while creating coupon",error)
  }
}
const enableCoupon = async (req,res)=>{
  try {

    const couponId = req.params.id

    await Coupon.updateOne({_id:couponId},{$set:{isActive:true}})
    return res.status(StatusCodes.OK).json({ success: true,message: ErrorMessages.COUPON_ENABLED})
    
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
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false,
      message: ErrorMessages.COUPON_ALREADY_EXISTS
    });
  }
    
    discountValue = Number(discountValue);
    minOrderAmount = Number(minOrderAmount);

    if(discountValue >= minOrderAmount/2){
      return res.status(StatusCodes.BAD_REQUEST).json({
        success:false,
        message: ErrorMessages.DISCOUNT_MUST_BE_LESS_THAN_TWICE_MINIMUM_ORDER
      });
    }
    
    await Coupon.findByIdAndUpdate(id,req.body)

    return res.status(StatusCodes.OK).json({ success: true})

    
  } catch (error) {
    console.error("Error while creating coupon",error)
  }
}
export default {loadCoupons,createCoupon,disableCoupon,enableCoupon,updateCoupon}