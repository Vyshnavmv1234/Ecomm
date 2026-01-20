import User from "../../models/userSchema.js"
import nodemailer from "nodemailer"
import env from "dotenv"
import bcrypt from "bcrypt"
import product from "../../models/productSchema.js"
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
      return res.render("user/userLogin",{message: null,user:null})
    }
    else{
      res.redirect("/user/homepage")
    }
    
  } catch (error) {
    
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
      return res.render("user/userLogin",{message:"User is blocked by ADMIN",user:null})
    }
    const passwordMatch = await bcrypt.compare(password,findUser.password)

    if(!passwordMatch){
      return res.render("user/userLogin",{message:"Incorrect Password",user:null})
    }
    req.session.user = findUser._id
    res.redirect("/user/homepage")
    
  } catch (error) {
    console.error("Login Error",error)
    res.render("user/userLogin",{message:"Login failed. Please try again later",user:null})
  }
}

//SIGNUP

const signup = async (req,res)=>{
  try {

    const {name,phone,email,password,cPassword} = req.body

    if(password!==cPassword){
     return res.render("user/userSignup",{message:"Password doesnt match",user:null})
    }

    const findUser = await User.findOne({email})
    if(findUser){
     return res.render("user/userSignup",{message:"Email already exists",user:null})
    }

    const otp = generateOtp()
    const emailSent = await sendVerificationEmail(email,otp)

    req.session.userOtp = otp
    req.session.userData = {name,phone,email,password}
    console.log("OTP is :",otp)
    res.render("user/userOtp")
    
    if(!emailSent){
      console.log("email")
    } 

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

//LOAD SIGNUP

const loadSignup = async (req,res)=>{
  try {

    return res.render("user/userSignup",{message:null,user:null})
  
  } catch (error) {
    console.log("Signup page not found")
    res.status(500).send("Server error")
  }
}
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

    const userData = await User.findById(req.session.user)
    const productData = await product.find({isBlocked:false})
    console.log(productData.images)

    if(req.session.user){
      res.render("user/productList",{user:userData,products:productData})
    }
    
  } catch (error) {
    
  }
}


export default {loadHomepage,pageNotFound,loadSignup,loadLogin,login,signup,verifyOtp,resentOtp,logout,loadProductList}