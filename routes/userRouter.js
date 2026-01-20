import passport from "passport"
import userController from "../controllers/user/userController.js"
import profileController from "../controllers/user/profileController.js"
import {userAuth} from "../middlewares/auth.js"
import uploadController from "../controllers/routeUpload.js";
import express from "express"
import {uploadUser} from "../middlewares/multer.js";

const router = express.Router()

//AUTHENTICATION
router.get("/login",userController.loadLogin)
router.post("/login",userController.login)
router.get("/homepage",userController.loadHomepage)
router.get("/pageNotFound",userController.pageNotFound)
router.get("/signup",userController.loadSignup)
router.post("/signup",userController.signup)
router.post("/verify-otp",userController.verifyOtp)
router.post("/resent-otp",userController.resentOtp) 

router.get("/auth/google",passport.authenticate("google",{scope:["profile","email"],}))
router.get("/auth/google/callback",passport.authenticate("google",{failureRedirect:"/user/login"}),(req,res)=>{
  req.session.user = req.session.passport.user
    res.redirect("/user/homepage"); 
})
router.get("/logout",userController.logout)   

//USERPROFILE

router.get("/forgot-password",profileController.getForgotPassword)
router.post("/forgot-pass-email-valid",profileController.forgotPassEmailValid)
router.post("/verify-forgot-password-Otp",profileController.verifyForgotPassOtp)
router.get("/reset-password",profileController.loadResetPassword)
router.post("/reset-password",profileController.newPassword)
router.post("/resend-forgot-otp",profileController.resendForgotPasswordOtp)
router.get("/userDashboard",userAuth,profileController.userDashboard)  
router.get("/userProfile",userAuth,profileController.userProfile)
router.get("/change-email",userAuth,profileController.changeEmail)
router.post("/change-email",userAuth,profileController.changeEmailValid)
router.post("/verify-change-email-otp",userAuth,profileController.verifyEmailOtp)
router.post("/verify-resend-change-email-otp",userAuth,profileController.resendEmailOtp)
router.get("/update-email",userAuth,profileController.loadUpdateEmail)
router.post("/update-email",userAuth,profileController.updateEmail)
router.get("/change-password",userAuth,profileController.changePassword)
router.post("/change-password",userAuth,profileController.changePasswordValid)
router.post("/verify-change-password-otp",userAuth,profileController.verifyChangePasswordOtp)
router.post("/verify-resend-change-password-otp",userAuth,profileController.resendChangePassword)
router.get("/reset-change-password",profileController.loadChangeResetPassword)
router.post("/reset-change-password",profileController.newChangePassword)
router.post("/upload",userAuth,uploadUser.single("image"),uploadController.uploadProfile)
router.get("/account", userAuth,uploadController.red)
 
//ADDRESS MANAGEMENT

router.get("/userAddress",userAuth,profileController.loadAddress)
router.get("/add-address",userAuth,profileController.loadAddAddress)
router.post('/add-address',userAuth,profileController.postAddAddress)
router.get("/edit-address",userAuth,profileController.loadEditAddress)
router.post("/edit-address",userAuth,profileController.postEditAddress)
router.get("/delete-address",userAuth,profileController.deleteAddress)

//PRODUCT LIST

router.get("/productList",userAuth,userController.loadProductList)


export default router 