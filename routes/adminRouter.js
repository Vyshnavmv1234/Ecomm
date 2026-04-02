import { adminAuth } from "../middlewares/auth.js"
import express from "express"
import adminController from "../controllers/admin/adminController.js"
import customerController from "../controllers/admin/customerController.js"
import productController from "../controllers/admin/productController.js"
import categoryController from "../controllers/admin/categoryController.js"
import { uploadProduct, uploadCategory } from "../middlewares/multer.js"
import orderController from "../controllers/admin/orderController.js"
import couponController from "../controllers/admin/couponController.js"
import offerController from "../controllers/admin/offerController.js"
import analyticsController from "../controllers/admin/analyticsController.js"

// ─────────────────────────────────────────────────
//  PUBLIC admin routes — no auth required
// ─────────────────────────────────────────────────
const publicRouter = express.Router()

publicRouter.get("/adminLogin", adminController.loadLogin)
publicRouter.post("/adminLogin", adminController.postLogin)
publicRouter.get("/pageNotFound", adminController.pageNotFound)
publicRouter.get("/logout", adminController.logout)


const protectedRouter = express.Router()

protectedRouter.use(adminAuth)

// Dashboard
protectedRouter.get("/adminDashboard", adminController.loadDashboard)
protectedRouter.get("/revenue-chart", analyticsController.getRevenueChart)
protectedRouter.get("/top-products", analyticsController.getTopProducts)

// Customer management
protectedRouter.get("/users", customerController.customerInfo)
protectedRouter.patch("/users/:id/block", customerController.customerBlock)
protectedRouter.patch("/users/:id/unblock", customerController.customerUnBlock)

// Product management
protectedRouter.get("/products", productController.loadProducts)
protectedRouter.get("/addProducts", productController.loadAddProducts)
protectedRouter.post("/addProduct", uploadProduct.array("images", 5), productController.postAddProducts)
protectedRouter.post("/addProducts", uploadProduct.array("images", 5), productController.postAddProducts)
protectedRouter.get("/editProduct/:id", productController.loadEditProduct)
protectedRouter.patch("/blockProduct/:id", productController.blockProduct)
protectedRouter.patch("/unblockProduct/:id", productController.unblockProduct)
protectedRouter.patch("/updateProduct/:id", uploadProduct.array("images", 5), productController.postEditProduct)

// Category management
protectedRouter.get("/category",                                                  categoryController.loadCategoryInfo)
protectedRouter.get("/category/new",                                              categoryController.loadaddCategory)
protectedRouter.post("/category/new",      uploadCategory.single("image"),        categoryController.postAddCategory)
protectedRouter.post("/add-category",      uploadCategory.single("image"),        categoryController.postAddCategory)
protectedRouter.get("/editCategory",                                              categoryController.loadEditCategory)
protectedRouter.patch("/category/block/:id",                                      categoryController.blockCategory)
protectedRouter.patch("/category/unblock/:id",                                    categoryController.unblockCategory)
protectedRouter.patch("/category/update/:id", uploadCategory.single("image"),    categoryController.updateCategory)

// Order management
protectedRouter.get("/order", orderController.order)
protectedRouter.get("/editOrder/:id", orderController.editOrder)
protectedRouter.post("/update-status", orderController.updateStatus)
protectedRouter.post("/handle-return", orderController.handleReturn)

// Coupon management
protectedRouter.get("/coupon/couponManagement", couponController.loadCoupons)
protectedRouter.post("/coupon/createCoupon", couponController.createCoupon)
protectedRouter.patch("/coupon/disableCoupon/:id", couponController.disableCoupon)
protectedRouter.patch("/coupon/enableCoupon/:id", couponController.enableCoupon)
protectedRouter.patch("/coupon/updateCoupon/:id", couponController.updateCoupon)

// Offer management
protectedRouter.get("/offers", offerController.loadOffer)
protectedRouter.post("/offer/addOffer", offerController.loadAddOffer)
protectedRouter.patch("/offer/toggle/:id", offerController.toggleOfferStatus)
protectedRouter.put("/offer/edit/:id", offerController.editOffer)

// Analytics
protectedRouter.get("/analytics", analyticsController.loadAnalytics)
protectedRouter.get("/analytics-data", analyticsController.postAnalytics)
protectedRouter.get("/analytics/export-pdf", analyticsController.exportPDF)
protectedRouter.get("/analytics/export-excel", analyticsController.exportExcel)

// ─────────────────────────────────────────────────
//  Combine into one export
// ─────────────────────────────────────────────────
const router = express.Router()
router.use(publicRouter)
router.use(protectedRouter)

export default router