import passport from "passport"
import userController from "../controllers/user/userController.js"
import express from "express"
const router = express.Router()

router.get("/login",userController.loadLogin)
router.post("/login",userController.login)
router.get("/homepage",userController.loadHomepage)
router.get("/pageNotFound",userController.pageNotFound)
router.get("/signup",userController.loadSignup)
router.post("/signup",userController.signup)
router.post("/verify-otp",userController.verifyOtp)
router.post("/resent-otp",userController.resentOtp)

router.get("/auth/google",passport.authenticate("google",{scope:["profile","email"],}))
router.get("/auth/google/callback",passport.authenticate("google",{failureRedirect:"/user/signup"}),(req,res)=>{
  res.redirect("/user/login")
})
router.get("/logout",userController.logout)
  
export default router 