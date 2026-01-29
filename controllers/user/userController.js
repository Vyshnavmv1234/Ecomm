import User from "../../models/userSchema.js"
import nodemailer from "nodemailer"
import env from "dotenv"
import bcrypt from "bcrypt"
import Category from "../../models/categorySchema.js"
import Product from "../../models/productSchema.js"
import ERROR_MESSAGES from "../../utitls/errorMessages.js"
import mongoose from "mongoose"

env.config()

//GEN OTP

function generateOtp(){
  return Math.floor(100000 + Math.random()*900000).toString()
}

//SEND MAIL

async function sendVerificationEmail(email,otp){
  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth:{
        user: process.env.NODE_MAILER_EMAIL,
        pass: process.env.NODE_MAILER_PASSWORD
      }
    })
    const info = await transporter.sendMail({
      from: process.env.NODE_MAILER_EMAIL,
      to: email,
      subject: "Verify your account",
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP is ${otp}</b>`,
    })
    return info.accepted.length >0
    
  } catch (error) {
    console.error("Error sending email",error)
    return false
  }  
}
//LOAD LOGIN

const loadLogin = async(req,res)=>{
  try {

    if(!req.session.user){

      return res.render("user/userLogin",{message: req.query.error,user:null})

    }else{
      return res.redirect("/user/homepage")
    }
  } catch (error) {

    console.error("Error loading loginpage",error)
    res.redirect("/user/pageNotFound")
  }
}
//LOAD SIGNUP

const loadSignup = async (req,res)=>{
  try {

    if(!req.session.user){
      return res.render("user/userSignup",{message:req.query.error,user:null})
    }else{
      return res.redirect("/user/homepage")
    }
  
  } catch (error) {
    console.log("Signup page not found")
    res.status(500).send("Server error")
  }
}

// LOGIN

const login = async (req,res)=>{
  try {

    const {email,password} = req.body

    const findUser = await User.findOne({isAdmin:0,email:email})

    if(!findUser){
      return res.render("user/userLogin",{message:"User not found",user:null})
    }
    if(findUser.isBlocked){
      return res.redirect("/user/login?error=User is blocked by ADMIN")
    }
    const passwordMatch = await bcrypt.compare(password,findUser.password)

    if(!passwordMatch){
      return res.redirect("/user/login?error=Incorrect Password")
    }
    req.session.user = findUser._id
    res.redirect("/user/homepage")
    
  } catch (error) {
    console.error("Login Error",error)
    res.render("user/userLogin",{message:"Login failed. Please try again later",user:null})
  }
}

//LOAD USEROTP

const loadOTP = async (req,res)=>{
  try {

    if(!req.session.user){
      return res.render("user/userOtp")
    }else{
      return res.redirect("/user/signup")
    }
    
  } catch (error) {
    console.error("ERROR loading otp",error)
  }
}

//SIGNUP

const signup = async (req,res)=>{
  try {

    const {name,phone,email,password,cPassword} = req.body

    if(password!==cPassword){
     return res.redirect("/user/signup?error=Password doesnt match")
    }

    const findUser = await User.findOne({email})
    if(findUser){
     return res.redirect("/user/signup?error=Email already exists")
    }

    const otp = generateOtp()
    const emailSent = await sendVerificationEmail(email,otp)

    req.session.userOtp = otp
    req.session.userData = {name,phone,email,password}
    console.log("OTP is :",otp)
    return res.redirect("/user/userOtp")

  } catch (error) {
    console.error("Signup Error",error)
    res.redirect("/user/pageNotFound")
  }
}


const pageNotFound = async (req,res)=>{ 
  try {

    res.render("user/error")

  } catch (error) {
    res.redirect("/pageNotFound")
  }
}  

//LOAD HOMEPAGE

const loadHomepage = async (req, res) => {
  try {
    let userData

    if (req.session.user) {
      userData = await User.findById(req.session.user)
    }
  
    res.render("user/userHome", { user: userData});

  } catch (error) {
    console.log("Homepage not found", error);
    res.status(500).send("Server error");
  }
};


//PASSWORD HASING

const securePassword = async (password)=>{
  try {

    const passwordHash = await bcrypt.hash(password,10)
    return passwordHash
    
  } catch (error) {
    console.error("error while hashing",error)
  }
}

//OTP VALIDATION + SAVING USER

const verifyOtp = async (req, res) => {
  try {

    const { otp } = req.body

  console.log("OTP from frontend:", otp)
  console.log("OTP in session:", req.session.userOtp)

  if (otp !== req.session.userOtp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP"
    })
  }
  const user = req.session.userData
  const passwordHash = await securePassword(user.password)

  const saveUserData = new User({
    name: user.name,
    email: user.email,
    phone: user.phone,
    password: passwordHash 
  })

  await saveUserData.save()
  req.session.user = saveUserData._id
  res.json({
    success:true
  })

  req.session.userOtp = null
    
  } catch (error) {
    console.error("Error verifying OTP",error)
    res.status(500).json({success:false,message:"An error occ"})
  }
}
//RESENT OTP

const resentOtp = async (req,res)=>{

  try {

    const userData = req.session.userData
    
    const otp = generateOtp()

    req.session.userOtp = otp;
    const emailsent = await sendVerificationEmail(userData.email,otp)

    if(!emailsent){
      return res.status(400).json({
        success:false,message:"Failed to resent"
      })
    }
    console.log("Resent OTP :",otp)
    return res.json({
      success:true,message:"Success"
    })
    
  } catch (error) {
    console.error("Error resending OTP", error)
    return res.status(500).json({
      success: false,
      message: "Server error while resending OTP"
    })
  }
}
//LOGOUT

const logout = async (req,res)=>{
  try {
   
    if(req.session.admin){
      req.session.user = null
      res.redirect("/user/login")
    }else{
      req.session.destroy((err)=>{
      if(err){
        console.error("Error while Destroying session")
       return res.redirect("/user/pageNotFound")
      }
      res.redirect("/user/login")
    })
    }
    
   
  } catch (error) {
    console.log("Logout error",error)
    res.redirect("/user/pageNotFound")
  }
}

const loadProductList = async(req,res)=>{
  try {

      const search = req.query.pSearch || ""
      const limit = 8
      const page = parseInt(req.query.page)||1
      const skip = (page-1)*limit
      const {category,price,sort} = req.query


      const unblockedCategories = await Category.find({isBlocked:false})
      const allowedCategoriesId = unblockedCategories.map((category)=>category._id)

      const pipeline = []

      if(search){

        pipeline.push({
          $match:{
            $or:[
              {name:{$regex:search,$options:"i"}},{title:{$regex:search,$options:"i"}}
            ]
          }
        })
      }

      let selectedIds = allowedCategoriesId;

      if (category) {
        const selectedCat = Array.isArray(category) ? category : [category];
        const allowed = allowedCategoriesId.map(String);

        selectedIds = selectedCat
          .filter(id => allowed.includes(id))
          .map(id => new mongoose.Types.ObjectId(id));
      }

      pipeline.push({
        $match:{
          isBlocked:false,
          category:{$in:selectedIds}
        }
      })

      pipeline.push({
        $addFields:{
          minVariantPrice:{$min:"$variants.price"}
        }
      })

      if(price){
        const [min,max] = price.split("-").map(val=>{
          return Number(val)
        })
        pipeline.push({
          $match:{
            minVariantPrice:{$gte:min,$lte:max}
          }
        })
      }

      let sortOption = {createdAt:-1}

      if(sort == "price_asc") sortOption = {minVariantPrice:1}
      if(sort == "price_desc") sortOption = {minVariantPrice:-1}
      if (sort === "az") sortOption = { name: 1 }
      if (sort === "za") sortOption = { name: -1 }

      pipeline.push({$sort: sortOption})
      pipeline.push({$skip:skip},{$limit:limit})

      const countPipeline = pipeline.filter(val=>{
        return !val.$limit &&!val.$skip && !val.$sort
      })
      countPipeline.push({$count:"total"})

      const countResult = await Product.aggregate(countPipeline)
      console.log(countResult[0])
      const totalProduct = countResult[0]?.total ||0
      const totalPages = Math.ceil(totalProduct/limit)

      const userData = await User.findById(req.session.user)
      const categoryData = await Category.find({isBlocked:false})
      const productData = await Product.aggregate(pipeline) 


      return res.render("user/productList",{
        user:userData,
        products:productData,
        limit,
        currentPage:page,
        totalPages,
        totalProduct,
        skip,
        search,
        category:categoryData,
        query:req.query
      })
    
    
  } catch (error) {   
    console.error(ERROR_MESSAGES.PRODUCT_LOAD_FAILED,error)
  }
}


export default {loadHomepage,pageNotFound,loadSignup,loadLogin,login,signup,loadOTP,verifyOtp,resentOtp,logout,loadProductList}