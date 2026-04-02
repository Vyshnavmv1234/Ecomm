import StatusCodes from '../utitls/statusCodes.js';
import passport from "passport"
import userController from "../controllers/user/userController.js"
import profileController from "../controllers/user/profileController.js"
import { userAuth, checkBlockedUser } from "../middlewares/auth.js"
import uploadController from "../controllers/routeUpload.js";
import express from "express"
import { uploadUser } from "../middlewares/multer.js";
import productController from "../controllers/user/productController.js";
import cartControlller from "../controllers/user/cartController.js"
import wishlistController from "../controllers/user/wishlistController.js"
import checkoutController from "../controllers/user/checkoutController.js"
import orderController from "../controllers/user/orderController.js"
import invoiceController from "../controllers/user/invoiceController.js"
import walletController from "../controllers/user/walletController.js";


const publicRouter = express.Router()

// Auth pages
publicRouter.get("/login", checkBlockedUser, userController.loadLogin)
publicRouter.post("/login", userController.login)
publicRouter.get("/signup", checkBlockedUser, userController.loadSignup)
publicRouter.post("/signup", userController.signup)
publicRouter.get("/logout", userController.logout)
publicRouter.get("/userOtp", userController.loadOTP)
publicRouter.get("/otp", userController.loadOTP)
publicRouter.post("/verify-otp", userController.verifyOtp)
publicRouter.post("/resent-otp", userController.resentOtp)
publicRouter.get("/pageNotFound", userController.pageNotFound)
publicRouter.get("/404", userController.pageNotFound)

// Google OAuth
publicRouter.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }))
publicRouter.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", failureMessage: true }),
  (req, res) => {
    req.session.user = req.session.passport.user
    res.redirect("/")
  }
)

// Forgot / Reset password
publicRouter.get("/forgot-password",             profileController.getForgotPassword)
publicRouter.post("/forgot-pass-email-valid",    profileController.forgotPassEmailValid)
publicRouter.post("/verify-forgot-password-Otp", profileController.verifyForgotPassOtp)  // capital O (original)
publicRouter.post("/verify-forgot-password-otp", profileController.verifyForgotPassOtp)  // lowercase alias (views call this)
publicRouter.get("/reset-password",              profileController.loadResetPassword)
publicRouter.post("/reset-password",             profileController.newPassword)
publicRouter.post("/resend-forgot-otp",          profileController.resendForgotPasswordOtp)
publicRouter.get("/reset-change-password", profileController.loadChangeResetPassword)
publicRouter.post("/reset-change-password", profileController.newChangePassword)
publicRouter.get("/profile/reset-change-password", profileController.loadChangeResetPassword)
publicRouter.post("/profile/reset-change-password", profileController.newChangePassword)

// Homepage & shop (browseable without login)
publicRouter.get("/", checkBlockedUser, userController.loadHomepage)
publicRouter.get("/homepage", checkBlockedUser, userController.loadHomepage)
publicRouter.get("/shop", checkBlockedUser, userController.loadProductList)
publicRouter.get("/productList", checkBlockedUser, userController.loadProductList)
publicRouter.get("/product", checkBlockedUser, productController.productDetail)
publicRouter.get("/productDetail", checkBlockedUser, productController.productDetail)

// ─────────────────────────────────────────────────
//  PROTECTED router  — userAuth applied to ALL routes below
// ─────────────────────────────────────────────────
const protectedRouter = express.Router()

// Apply userAuth middleware once for every route in this router
protectedRouter.use(userAuth)

// Profile
protectedRouter.get("/userDashboard", profileController.userDashboard)
protectedRouter.get("/userProfile", profileController.userProfile)
protectedRouter.get("/account", uploadController.red)
protectedRouter.get("/profile", profileController.userDashboard)
protectedRouter.get("/profile/details", profileController.userProfile)

// Profile image upload
protectedRouter.post("/upload", (req, res) => {
  uploadUser.single("image")(req, res, function (err) {
    if (err) return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: err.message });
    uploadController.uploadProfile(req, res);
  });
})

// Change email
protectedRouter.get("/change-email", profileController.changeEmail)
protectedRouter.post("/change-email", profileController.changeEmailValid)
protectedRouter.post("/verify-change-email-otp", profileController.verifyEmailOtp)
protectedRouter.post("/verify-resend-change-email-otp", profileController.resendEmailOtp)
protectedRouter.get("/update-email", profileController.loadUpdateEmail)
protectedRouter.post("/update-email", profileController.updateEmail)
protectedRouter.get("/profile/change-email", profileController.changeEmail)
protectedRouter.post("/profile/change-email", profileController.changeEmailValid)
protectedRouter.post("/profile/verify-change-email-otp", profileController.verifyEmailOtp)
protectedRouter.post("/profile/verify-resend-change-email-otp", profileController.resendEmailOtp)
protectedRouter.get("/profile/update-email", profileController.loadUpdateEmail)
protectedRouter.post("/profile/update-email", profileController.updateEmail)

// Change password
protectedRouter.get("/change-password", profileController.changePassword)
protectedRouter.post("/change-password", profileController.changePasswordValid)
protectedRouter.post("/verify-change-password-otp", profileController.verifyChangePasswordOtp)
protectedRouter.post("/verify-resend-change-password-otp", profileController.resendChangePassword)
protectedRouter.get("/profile/change-password", profileController.changePassword)
protectedRouter.post("/profile/change-password", profileController.changePasswordValid)
protectedRouter.post("/profile/verify-change-password-otp", profileController.verifyChangePasswordOtp)
protectedRouter.post("/profile/verify-resend-change-password-otp", profileController.resendChangePassword)

// Address management
protectedRouter.get("/userAddress", profileController.loadAddress)
protectedRouter.get("/add-address", profileController.loadAddAddress)
protectedRouter.post("/add-address", profileController.postAddAddress)
protectedRouter.get("/edit-address", profileController.loadEditAddress)
protectedRouter.post("/edit-address", profileController.postEditAddress)
protectedRouter.get("/delete-address", profileController.deleteAddress)
protectedRouter.patch("/address/set-default", profileController.setDefaultAddress)
protectedRouter.get("/profile/address", profileController.loadAddress)
protectedRouter.get("/profile/add-address", profileController.loadAddAddress)
protectedRouter.post("/profile/add-address", profileController.postAddAddress)
protectedRouter.get("/profile/edit-address", profileController.loadEditAddress)
protectedRouter.post("/profile/edit-address", profileController.postEditAddress)
protectedRouter.get("/profile/delete-address", profileController.deleteAddress)
protectedRouter.patch("/profile/address/set-default", profileController.setDefaultAddress)

// Cart
protectedRouter.get("/cart", cartControlller.loadAddToCart)
protectedRouter.post("/cart", cartControlller.addToCart)
protectedRouter.patch("/cart/update-qty", cartControlller.updateQuantity)
protectedRouter.delete("/cart/remove", cartControlller.cartRemove)

// Wishlist
protectedRouter.get("/wishlist", wishlistController.loadWishlist)
protectedRouter.post("/wishlist", wishlistController.postWishlist)
protectedRouter.delete("/remove/wishlist", wishlistController.deleteWishlist)

// Checkout
protectedRouter.get("/checkout", checkoutController.loadCheckout)
protectedRouter.post("/checkout", checkoutController.postCheckout)

// Orders
protectedRouter.get("/ordersHistory", orderController.orderHistory)
protectedRouter.get("/orders", orderController.orderHistory)
protectedRouter.get("/order/:id", orderController.orderSuccess)
protectedRouter.get("/orders/:id", orderController.orderSuccess)
protectedRouter.get("/orderDetail/:id", orderController.orderDetail)
protectedRouter.get("/orders/detail/:id", orderController.orderDetail)
protectedRouter.get("/order/:orderId/invoice", invoiceController.generateInvoice)
protectedRouter.get("/orders/:orderId/invoice", invoiceController.generateInvoice)
protectedRouter.post("/place-order", orderController.placeOrder)
protectedRouter.post("/cancelProduct", orderController.cancelProduct)
protectedRouter.post("/cancelOrder", orderController.cancelOrder)
protectedRouter.post("/request-return", orderController.requestReturn)
protectedRouter.post("/request-returnItem", orderController.requestItemReturn)

// Payment
protectedRouter.post("/create-razorpay-order", checkoutController.createRazorpayOrder)
protectedRouter.post("/verify-payment", checkoutController.verifyPayment)
protectedRouter.get("/paymentFailed", checkoutController.paymentFailed)
protectedRouter.get("/payment-failed", checkoutController.paymentFailed)
protectedRouter.post("/update-payment-status", checkoutController.updatePaymentStatus)

// Coupon
protectedRouter.post("/coupon/applyCoupon", checkoutController.applyCoupon)
protectedRouter.post("/coupon/removeCoupon", checkoutController.removeCoupon)

// Wallet
protectedRouter.get("/wallet", walletController.loadWallet)
protectedRouter.post("/wallet/create-order", walletController.createWalletOrder)
protectedRouter.post("/wallet/verify-payment", walletController.verifyWalletPayment)

const router = express.Router()
router.use(publicRouter)
router.use(protectedRouter)

export default router