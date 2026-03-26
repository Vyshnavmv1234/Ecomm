import StatusCodes from '../utitls/statusCodes.js';
import ErrorMessages from '../utitls/errorMessages.js';
import passport from "passport"
import userController from "../controllers/user/userController.js"
import profileController from "../controllers/user/profileController.js"
import { userAuth, checkBlockedUser } from "../middlewares/auth.js"
import uploadController from "../controllers/routeUpload.js";
import express from "express"
import { uploadUser } from "../middlewares/multer.js";
import product from "../models/productSchema.js";
import productController from "../controllers/user/productController.js";
import cartControlller from "../controllers/user/cartController.js"
import wishlistController from "../controllers/user/wishlistController.js"
import checkoutController from "../controllers/user/checkoutController.js"
import orderController from "../controllers/user/orderController.js"
import invoiceController from "../controllers/user/invoiceController.js"
import walletController from "../controllers/user/walletController.js";

const router = express.Router()

//AUTHENTICATION
router.get("/login", checkBlockedUser, userController.loadLogin)
router.post("/login", userController.login)
router.get("/userOtp", userController.loadOTP)
router.get("/homepage", checkBlockedUser, userController.loadHomepage)
router.get("/pageNotFound", userController.pageNotFound)
router.get("/signup", checkBlockedUser, userController.loadSignup)
router.post("/signup", userController.signup)
router.post("/verify-otp", userController.verifyOtp)
router.post("/resent-otp", userController.resentOtp)

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], }))
router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/user/login", failureMessage: true }), (req, res) => {
  req.session.user = req.session.passport.user
  res.redirect("/user/homepage");
})
router.get("/logout", userController.logout)

//USERPROFILE

router.get("/forgot-password", profileController.getForgotPassword)
router.post("/forgot-pass-email-valid", profileController.forgotPassEmailValid)
router.post("/verify-forgot-password-Otp", profileController.verifyForgotPassOtp)
router.get("/reset-password", profileController.loadResetPassword)
router.post("/reset-password", profileController.newPassword)
router.post("/resend-forgot-otp", profileController.resendForgotPasswordOtp)
router.get("/userDashboard", userAuth, profileController.userDashboard)
router.get("/userProfile", userAuth, profileController.userProfile)
router.get("/change-email", userAuth, profileController.changeEmail)
router.post("/change-email", userAuth, profileController.changeEmailValid)
router.post("/verify-change-email-otp", userAuth, profileController.verifyEmailOtp)
router.post("/verify-resend-change-email-otp", userAuth, profileController.resendEmailOtp)
router.get("/update-email", userAuth, profileController.loadUpdateEmail)
router.post("/update-email", userAuth, profileController.updateEmail)
router.get("/change-password", userAuth, profileController.changePassword)
router.post("/change-password", userAuth, profileController.changePasswordValid)
router.post("/verify-change-password-otp", userAuth, profileController.verifyChangePasswordOtp)
router.post("/verify-resend-change-password-otp", userAuth, profileController.resendChangePassword)
router.get("/reset-change-password", profileController.loadChangeResetPassword)
router.post("/reset-change-password", profileController.newChangePassword)

router.post("/upload", userAuth, (req, res) => {

  uploadUser.single("image")(req, res, function (err) {

    if (err) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: err.message
      });
    }
    uploadController.uploadProfile(req, res);
  });
});
router.get("/account", userAuth, uploadController.red)

//ADDRESS MANAGEMENT

router.get("/userAddress", userAuth, profileController.loadAddress)
router.get("/add-address", userAuth, profileController.loadAddAddress)
router.post('/add-address', userAuth, profileController.postAddAddress)
router.get("/edit-address", userAuth, profileController.loadEditAddress)
router.post("/edit-address", userAuth, profileController.postEditAddress)
router.get("/delete-address", userAuth, profileController.deleteAddress)
router.patch("/address/set-default", userAuth, profileController.setDefaultAddress)

//PRODUCT LISTINGS + Details

router.get("/productList", checkBlockedUser, userController.loadProductList)
router.get("/productDetail", checkBlockedUser, productController.productDetail)

//CART MANAGEMENT

router.get("/cart", userAuth, cartControlller.loadAddToCart)
router.post("/cart", userAuth, cartControlller.addToCart)
router.patch("/cart/update-qty", cartControlller.updateQuantity)
router.delete("/cart/remove", userAuth, cartControlller.cartRemove)

//WISHLIST

router.get("/wishlist", userAuth, wishlistController.loadWishlist)
router.post("/wishlist", userAuth, wishlistController.postWishlist)
router.delete("/remove/wishlist", userAuth, wishlistController.deleteWishlist)

//CHECKOUT

router.get("/checkout", userAuth, checkoutController.loadCheckout)
router.post("/checkout", userAuth, checkoutController.postCheckout)

//ORDERS

router.get("/order/:id", userAuth, orderController.orderSuccess)
router.post("/place-order", userAuth, orderController.placeOrder)
router.get("/orderDetail/:id", userAuth, orderController.orderDetail)
router.post("/cancelProduct", userAuth, orderController.cancelProduct)
router.post("/cancelOrder", userAuth, orderController.cancelOrder)
router.get("/order/:orderId/invoice", userAuth, invoiceController.generateInvoice)
router.get("/ordersHistory", userAuth, orderController.orderHistory)
router.post("/request-return", userAuth, orderController.requestReturn)
router.post("/request-returnItem", userAuth, orderController.requestItemReturn)


//PAYMENT

router.post("/create-razorpay-order", userAuth, checkoutController.createRazorpayOrder);
router.post("/verify-payment", userAuth, checkoutController.verifyPayment);
router.get("/paymentFailed", userAuth, checkoutController.paymentFailed)
router.post("/update-payment-status", checkoutController.updatePaymentStatus);

//COUPON

router.post("/coupon/applyCoupon", userAuth, checkoutController.applyCoupon)
router.post("/coupon/removeCoupon", userAuth, checkoutController.removeCoupon)

//WALLET

router.get("/wallet", userAuth, walletController.loadWallet)
router.post("/wallet/create-order", walletController.createWalletOrder)
router.post("/wallet/verify-payment", walletController.verifyWalletPayment)


// ─────────────────────────────────────────────────────────────
// CLEAN URL ALIASES  (mounted at "/" in app.js alongside /user)
// Old /user/... routes stay working — nothing is removed.
// ─────────────────────────────────────────────────────────────

// Auth
router.get("/login",          checkBlockedUser, userController.loadLogin)
router.post("/login",         userController.login)
router.get("/signup",         checkBlockedUser, userController.loadSignup)
router.post("/signup",        userController.signup)
router.get("/logout",         userController.logout)
router.get("/otp",            userController.loadOTP)
router.post("/verify-otp",    userController.verifyOtp)
router.post("/resent-otp",    userController.resentOtp)
router.get("/404",            userController.pageNotFound)

// Google OAuth
router.get("/auth/google",    passport.authenticate("google", { scope: ["profile", "email"] }))
router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", failureMessage: true }),
  (req, res) => {
    req.session.user = req.session.passport.user
    res.redirect("/")
  }
)

// Forgot / Reset password
router.get("/forgot-password",              profileController.getForgotPassword)
router.post("/forgot-pass-email-valid",     profileController.forgotPassEmailValid)
router.post("/verify-forgot-password-Otp",  profileController.verifyForgotPassOtp)
router.get("/reset-password",               profileController.loadResetPassword)
router.post("/reset-password",              profileController.newPassword)
router.post("/resend-forgot-otp",           profileController.resendForgotPasswordOtp)

// Homepage & shop
router.get("/",     checkBlockedUser, userController.loadHomepage)
router.get("/shop", checkBlockedUser, userController.loadProductList)
router.get("/product", checkBlockedUser, productController.productDetail)

// Profile
router.get("/profile",          userAuth, profileController.userDashboard)
router.get("/profile/details",  userAuth, profileController.userProfile)
router.post("/upload",          userAuth, (req, res) => {
  uploadUser.single("image")(req, res, function (err) {
    if (err) return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: err.message });
    uploadController.uploadProfile(req, res);
  });
})

// Password change
router.get("/profile/change-email",                    userAuth, profileController.changeEmail)
router.post("/profile/change-email",                   userAuth, profileController.changeEmailValid)
router.post("/profile/verify-change-email-otp",        userAuth, profileController.verifyEmailOtp)
router.post("/profile/verify-resend-change-email-otp", userAuth, profileController.resendEmailOtp)
router.get("/profile/update-email",                    userAuth, profileController.loadUpdateEmail)
router.post("/profile/update-email",                   userAuth, profileController.updateEmail)
router.get("/profile/change-password",                 userAuth, profileController.changePassword)
router.post("/profile/change-password",                userAuth, profileController.changePasswordValid)
router.post("/profile/verify-change-password-otp",     userAuth, profileController.verifyChangePasswordOtp)
router.post("/profile/verify-resend-change-password-otp", userAuth, profileController.resendChangePassword)
router.get("/profile/reset-change-password",  profileController.loadChangeResetPassword)
router.post("/profile/reset-change-password", profileController.newChangePassword)

// Address
router.get("/profile/address",       userAuth, profileController.loadAddress)
router.get("/profile/add-address",   userAuth, profileController.loadAddAddress)
router.post("/profile/add-address",  userAuth, profileController.postAddAddress)
router.get("/profile/edit-address",  userAuth, profileController.loadEditAddress)
router.post("/profile/edit-address", userAuth, profileController.postEditAddress)
router.get("/profile/delete-address", userAuth, profileController.deleteAddress)
router.patch("/profile/address/set-default", userAuth, profileController.setDefaultAddress)

// Cart
router.get("/cart",               userAuth, cartControlller.loadAddToCart)
router.post("/cart",              userAuth, cartControlller.addToCart)
router.patch("/cart/update-qty",  cartControlller.updateQuantity)
router.delete("/cart/remove",     userAuth, cartControlller.cartRemove)

// Wishlist
router.get("/wishlist",            userAuth, wishlistController.loadWishlist)
router.post("/wishlist",           userAuth, wishlistController.postWishlist)
router.delete("/remove/wishlist",  userAuth, wishlistController.deleteWishlist)

// Checkout
router.get("/checkout",  userAuth, checkoutController.loadCheckout)
router.post("/checkout", userAuth, checkoutController.postCheckout)

// Orders
router.get("/orders",                    userAuth, orderController.orderHistory)
router.get("/orders/:id",                userAuth, orderController.orderSuccess)
router.get("/orders/detail/:id",         userAuth, orderController.orderDetail)
router.get("/orders/:orderId/invoice",   userAuth, invoiceController.generateInvoice)
router.post("/place-order",              userAuth, orderController.placeOrder)
router.post("/cancelProduct",            userAuth, orderController.cancelProduct)
router.post("/cancelOrder",              userAuth, orderController.cancelOrder)
router.post("/request-return",           userAuth, orderController.requestReturn)
router.post("/request-returnItem",       userAuth, orderController.requestItemReturn)

// Payment
router.post("/create-razorpay-order",  userAuth, checkoutController.createRazorpayOrder)
router.post("/verify-payment",         userAuth, checkoutController.verifyPayment)
router.get("/payment-failed",          userAuth, checkoutController.paymentFailed)
router.post("/update-payment-status",  checkoutController.updatePaymentStatus)

// Coupon
router.post("/coupon/applyCoupon",  userAuth, checkoutController.applyCoupon)
router.post("/coupon/removeCoupon", userAuth, checkoutController.removeCoupon)

// Wallet
router.get("/wallet",                userAuth, walletController.loadWallet)
router.post("/wallet/create-order",  walletController.createWalletOrder)
router.post("/wallet/verify-payment", walletController.verifyWalletPayment)

export default router