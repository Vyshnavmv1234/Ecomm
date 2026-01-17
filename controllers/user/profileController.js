import User from "../../models/userSchema.js"
import Address from "../../models/addressSchema.js"
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"


const securePassword = async (password)=>{
  try {
    
    const passwordHash = await bcrypt.hash(password,10)
    return passwordHash
  } catch (error) {
    console.log("Error while hashing",error)
  }
}

const getForgotPassword = async(req,res)=>{
  try { 

    res.render("user/forgotPasswordEmail",{user:null,message:null})
    
  } catch (error) {  
    console.log(error)
  }
}

//FORGET PASSWORD VALIDATING EMAIL

const forgotPassEmailValid = async (req, res) => {
  try {
    const { email } = req.body;

    const userExists = await User.findOne({ email });

    if (!userExists) {
      return res.render("user/forgotPasswordEmail", {
        user: null,
        message: "User with this email not found"
      });
    }

    const otp = generateOtp();
    req.session.otp = otp;
    req.session.email = email;
    req.session.otpVerified = false;

    const emailSent = await sendVerificationEmail(email, otp);

    if (!emailSent) {
      return res.render("user/forgotPasswordEmail", {
        user: null,
        message: "Failed to send OTP"
      });
    }

    console.log("OTP:", otp); 

    return res.render("user/forgotPasswordOtp", { message: null });

  } catch (error) {
    console.log(error);
    res.redirect("/user/pageNotFound");
  }
};


const verifyForgotPassOtp = async (req, res) => {
  try {
    const userEnteredOtp = req.body.otp;
    const sessionOtp = req.session.otp;

    if (userEnteredOtp !== sessionOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    req.session.otpVerified = true;

    return res.status(200).json({
      success: true,
      message: "OTP verified"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Verification failed"
    });
  }
};

const loadResetPassword = async(req,res)=>{
  try {

    if(!req.session.otpVerified){
      res.redirect("/user/forgot-password")
    }
    res.render("user/resetPassword",{user:null,message:null}) 
    
  } catch (error) {
    
  }
}

//RESEND OTP 

const resendForgotPasswordOtp = async (req, res) => {
  try {
    const email = req.session.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Error sending mail"
      });
    }

    const otp = generateOtp();
    req.session.otp = otp;

    const emailSent = await sendVerificationEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to resend OTP"
      });
    }

    console.log("Resent OTP:", otp); 

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};


//CREATING NEW PASSWORD
const newPassword = async(req,res)=>{
  try {
    const pass1 = req.body.newPassword
    const pass2 = req.body.confirmPassword
    const email = req.session.email

  if(pass1===pass2){

    const passwordHash = await securePassword(pass1)
    await User.updateOne({email:email},{$set:{password:passwordHash}})
    res.redirect("/user/login")
  }
  else{
    res.render("user/resetpassword",{message:"Passwords do not match",user:null})
  }
  } catch (error) {
    res.redirect("/user/pageNotFound")
  }
}

const userDashboard = async(req,res)=>{
  try {
    const userId = req.session.user
    const userData = await User.findById(userId)
    console.log("userDash hitttt")
    
    if(req.session.user){
     return res.render("user/userDashboard",{user:userData,activePage: "dashboard"})
    }
    res.redirect("/user/login")
    
  } catch (error) { 
    console.error("Error getting profile data",error)
    res.redirect("/user/pageNotFound")
  }         
}

const userProfile = async(req,res)=>{
  try {
    const userId = req.session.user
    const userData = await User.findById(userId)
    
    if(req.session.user){ 
     return res.render("user/userProfile",{user:userData,activePage: "account"})
    }
    res.redirect("/user/login")
    
    
  } catch (error) {
    console.error("Error getting profile data",error)
    res.redirect("user/pageNotFound")
  }
}

const changeEmail = async(req,res)=>{
  try {

    const userId = req.session.user
    const userData = await User.findById(userId)
    req.session.userData = userData

     res.render("user/changeEmail",{user:userData,message:null})
    
  } catch (error) {
    res.redirect("/user/pageNotFound")
  }
}

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

const changeEmailValid = async(req,res)=>{
  try {

    const {email} = req.body
    const userExists = await User.findOne({email})
    
    if(userExists){
      const otp = generateOtp()
      const emailSent = sendVerificationEmail(email,otp)
      res.render("user/changeEmailOtp",{user:null,message:null})

      if(emailSent){
        req.session.otp = otp
        req.session.userData = req.body
        req.session.email = email
        console.log("EMAIL:",email)
        console.log("OTP:",otp)
      }else{
        res.json("email-error")
      }
    }
    else{
      res.render("user/changeEmail",{user:null,message:"User doesnt exists"})
    }
  } catch (error){
    console.error("Error while changing email",error)
    res.redirect("/user/pageNOtFound")
  }
}

//VERIFY EMAIL OTP

const verifyEmailOtp = async (req,res)=>{
  try {

  const userEnteredOtp = req.body.otp
  const sessionOtp = req.session.otp
  console.log("User OTP:", userEnteredOtp);
  console.log("Session OTP:", sessionOtp);


  if(userEnteredOtp!==sessionOtp){
    return res.status(400).json({
      success:false,
      message:"Invalid OTP"
    })
  }
  req.session.emailOtpVerified = true;
  
  return res.status(200).json({
    success:true,
    message:"OTP verified"
  })

  } catch (error) {
      return res.status(500).json({
      success: false,
      message: "Verification failed"
  })
}
}
//RESEND EMAIL OTP

const resendEmailOtp = async (req, res) => {
  try {
    const email = req.session.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Error sending mail"
      });
    }

    const otp = generateOtp();
    req.session.otp = otp;

    const emailSent = await sendVerificationEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to resend OTP"
      });
    }

    console.log("Resent OTP:", otp); 

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};
//LOAD UPDATE-EMAIL-PAGE

const loadUpdateEmail= async(req,res)=>{
  try {
    const userId = req.session.user
    const userData = await User.findById(userId)

    if(req.session.emailOtpVerified){
      res.render("user/newEmail",{user:userData,message:null})
    }
    
  } catch (error) {
    
  }
}
//UPDATE EMAIL

const updateEmail = async (req,res)=>{
  try {

  const newEmail = req.body.email
  const userId = req.session.user
  console.log("up email:", newEmail);
  console.log("userid:", userId);

  await User.findByIdAndUpdate(userId,{email:newEmail})
  res.redirect("/user/userProfile")
    
  } catch (error) {
    res.redirect("/user/pageNotFound")
  }
}
const changePassword = async (req,res)=>{
   try {
    const userId = req.session.user
    const userData = await User.findById(userId)

    res.render("user/changePasswordEmail",{user:userData,message:null})
    
   } catch (error) {
    res.redirect("/user/pageNotFound")
   }
}
//TO CHECK EMAIL OF USER IS FOUND OR NOT

const changePasswordValid = async(req,res)=>{
  try {

    const {email} = req.body
    const userExists = await User.findOne({email})
    
    if(userExists){
      const otp = generateOtp()
      const emailSent = sendVerificationEmail(email,otp)
      res.render("user/changePasswordOtp",{user:null,message:null})

      if(emailSent){
        req.session.otp = otp
        req.session.userData = req.body
        req.session.email = email
        console.log("EMAIL:",email)
        console.log("OTP:",otp)
      }else{
        res.json("email-error")
      }
    }
    else{
      res.render("user/changePassword",{user:null,message:"User doesnt exists"})
    }
  } catch (error){
    console.error("Error while changing email",error)
    res.redirect("/user/pageNOtFound")
  }
}

const verifyChangePasswordOtp = async (req,res)=>{
  try {

  const userEnteredOtp = req.body.otp
  const sessionOtp = req.session.otp
  console.log("User OTP:", userEnteredOtp); 
  console.log("Session OTP:", sessionOtp);


  if(userEnteredOtp!==sessionOtp){
    return res.status(400).json({
      success:false,
      message:"Invalid OTP"
    })
  }
  req.session.changePasswordVerified = true;
  
  return res.status(200).json({
    success:true,
    message:"OTP verified"
  })

  } catch (error) {
      return res.status(500).json({
      success: false,
      message: "Verification failed"
  })
}
}
const resendChangePassword = async (req, res) => {
  try {
    const email = req.session.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Error sending mail"
      });
    }
    
    const otp = generateOtp();
    req.session.otp = otp;

    const emailSent = await sendVerificationEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to resend OTP"
      }); 
    }

    console.log("Resent OTP:", otp); 

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully"
    }); 

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};

const loadChangeResetPassword = async(req,res)=>{
  try {
    const userData = await User.findById(req.session.user)

    if(!req.session.changePasswordVerified){
      res.redirect("/user/forgot-password")
    }
    res.render("user/resetChangePassword",{user:userData,message:null}) 
    
   } catch (error) {
    
  }
}

const newChangePassword = async(req,res)=>{
  try {
    const pass1 = req.body.newPassword
    const pass2 = req.body.confirmPassword
    const email = req.session.email

  if(pass1===pass2){

    const passwordHash = await securePassword(pass1)
    await User.updateOne({email:email} , {$set:{password:passwordHash}})
    res.redirect("/user/login")
  }
  else{
    res.render("user/resetChangePassword",{message:"Passwords do not match",user:null})
  }
  } catch (error) {
    res.redirect("/user/pageNotFound")
  }
}



//ADD ADDRESS 
const loadAddAddress = async (req,res)=>{
  try {
    
    const userId = req.session.user
    const userData = await User.findById(userId)
    res.render("user/userAddAddress",{user:userData,activePage: "address"})

  } catch (error) {

    console.log("error occured while loading",error)
    res.redirect("/user/pageNotFound")
  }
}

const postAddAddress = async (req,res)=>{
  try {

    const user = req.session.user
    const userData = await User.findById(user)

    const {name,phone,pincode,state,city,streetName} = req.body
    const userAddress = await Address.findOne({user_id:userData._id})

    if(!userAddress){

      const newAddress = new Address({
        
        user_id : userData._id,
        address : [{name,phone,pincode,state,city,streetName}]
      })
      await newAddress.save()
 
    }else{
      userAddress.address.push({name,phone,city,state,pincode,streetName})
      await userAddress.save()
    }
    res.redirect("/user/userAddress");
    
  } catch (error) {
    
    console.log("Error while adding addresss",error)
    res.redirect("/user/pageNotFound")
  }
}

const loadAddress = async (req, res) => {
  try {
    
    const userId = req.session.user
    const userData = await User.findById(userId)
    
    const userAddress = await Address.findOne({user_id:userData._id})

    res.render("user/userAddress",{user:userData,userAddress,activePage: "address"})
    
  } catch (error) {
    
    console.error("Error loading address", error);
    res.redirect("/user/pageNotFound");
  }
}

const loadEditAddress = async(req,res)=>{
  try {
    
    const userData = await User.findById(req.session.user)
    req.session.userData = userData
    
    const addressId = req.query.id
   
    const currAddress = await Address.findOne({user_id: req.session.user})

    if(!currAddress){
      res.redirect("/user/pageNotFound")
    }
    
    const addressData = currAddress.address.find((val)=>{
      return val.id === addressId
    })

    res.render("user/userEditAddress",{user:userData,address: addressData})
  } catch (error) {
    
    console.log("Error in loading edit address",error)
    res.redirect("/user/pageNotFound")
  }
}

const postEditAddress = async(req,res)=>{
  try {

    const data = req.body
    const addressId = req.query.id
    console.log(addressId)
    const findAddress = await Address.findOne({"user_id":req.session.user})

    if(!findAddress){
      res.redirect("/user/pageNotFound")
    }
    await Address.updateOne({
    "address._id": addressId},{$set:{
      "address.$" : {
        _id:addressId,
        name:data.name,
        city:data.city,
        state:data.state,
        pincode:data.pincode,
        phone:data.phone,
        streetName:data.streetName
      }
    }})
    res.redirect("/user/userAddress")
     
  } catch (error) { 
     console.error("Error while editing address",error)
     res.redirect("/user/pageNotFound")
  }
}
const deleteAddress = async(req,res)=>{

  try {

    const addressId = req.query.id
  const findAddress = await Address.findOne({user_id:req.session.user})
  if(!findAddress){
    res.status(404).send("Address not found")
  }

  await Address.updateOne({"address._id":addressId},{$pull:{
    address:{
      _id:addressId
    }
  }})
  res.redirect("/user/userAddress")
    
  } catch (error) {
    
    res.redirect("/user/pageNotFound")  
  }
}

export default {getForgotPassword,loadResetPassword,forgotPassEmailValid,resendForgotPasswordOtp,loadUpdateEmail,verifyForgotPassOtp,newPassword,userDashboard,userProfile,changeEmail,changeEmailValid,verifyEmailOtp,resendEmailOtp,updateEmail,changePassword,changePasswordValid,verifyChangePasswordOtp,resendChangePassword,loadChangeResetPassword,newChangePassword,loadAddAddress,postAddAddress,loadEditAddress,loadAddress,postEditAddress,deleteAddress}