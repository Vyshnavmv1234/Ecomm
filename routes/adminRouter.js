import {adminAuth} from "../middlewares/auth.js"
import express from "express"
import adminController from "../controllers/admin/adminController.js"
import customerController from "../controllers/admin/customerController.js"
import productController from "../controllers/admin/productController.js"
import categoryController from "../controllers/admin/categoryController.js"
import { uploadProduct } from "../middlewares/multer.js"
import { uploadCategory } from "../middlewares/multer.js"
import orderController from "../controllers/admin/orderController.js"
import couponController from "../controllers/admin/couponController.js"
import offerController from "../controllers/admin/offerController.js"
import analyticsController from "../controllers/admin/analyticsController.js"


const router = express.Router()

//AUTH MANAGEMENT

router.get("/adminLogin",adminController.loadLogin)
router.post("/adminLogin",adminController.postLogin)
router.get("/adminDashboard",adminAuth,adminController.loadDashboard)
router.get("/pageNotFound",adminController.pageNotFound)
router.get("/logout",adminController.logout)

//CUSTOMER MANAGEMENT

router.get("/users",adminAuth,customerController.customerInfo)
router.patch("/users/:id/block",adminAuth,customerController.customerBlock)
router.patch("/users/:id/unblock",adminAuth,customerController.customerUnBlock)

//PRODUCT MANAGEMENT

router.get("/products",adminAuth,productController.loadProducts)
router.get("/addProducts",adminAuth,productController.loadAddProducts)
router.post("/addProduct",adminAuth,uploadProduct.array("images", 5),productController.postAddProducts)
router.post("/addProducts",adminAuth,uploadProduct.array("images", 5),productController.postAddProducts)

router.get("/editProduct/:id",adminAuth,productController.loadEditProduct)
router.patch("/blockProduct/:id",adminAuth,productController.blockProduct)
router.patch("/unblockProduct/:id",adminAuth,productController.unblockProduct)
router.patch("/updateProduct/:id",adminAuth,uploadProduct.array("images", 5),productController.postEditProduct)

//CATEGORY MANAGEMENT

router.get("/category",adminAuth,categoryController.loadCategoryInfo)
router.get("/addCategory",adminAuth,categoryController.loadaddCategory)
router.post("/addCategory",adminAuth,categoryController.postAddCategory)
router.get("/editCategory",adminAuth,categoryController.loadEditCategory)
router.patch("/category/block/:id",adminAuth,categoryController.blockCategory)
router.patch("/category/unblock/:id",adminAuth,categoryController.unblockCategory)
router.patch("/category/update/:id",adminAuth,uploadCategory.single("image"),categoryController.updateCategory)
router.post("/add-category",uploadCategory.single("image"),categoryController.postAddCategory)

//ORDER MANAGEMENT

router.get("/order",adminAuth,orderController.order)
router.get("/editOrder/:id",adminAuth,orderController.editOrder)
router.post("/update-status",adminAuth,orderController.updateStatus)
router.post("/handle-return",adminAuth, orderController.handleReturn);

//COUPON MANAGEMENT

router.get("/coupon/couponManagement",adminAuth,couponController.loadCoupons)
router.post("/coupon/createCoupon",adminAuth,couponController.createCoupon)
router.patch("/coupon/disableCoupon/:id",adminAuth,couponController.disableCoupon)
router.patch("/coupon/enableCoupon/:id",adminAuth,couponController.enableCoupon)
router.patch("/coupon/updateCoupon/:id",adminAuth,couponController.updateCoupon)

//OFFER

router.get("/offers",adminAuth,offerController.loadOffer)
router.post("/offer/addOffer",adminAuth,offerController.loadAddOffer)
router.patch("/offer/toggle/:id",adminAuth,offerController.toggleOfferStatus)
router.put("/offer/edit/:id",adminAuth,offerController.editOffer);

//ANALYTICS

router.get("/analytics",adminAuth,analyticsController.loadAnalytics)
router.get("/analytics-data",adminAuth,analyticsController.postAnalytics);
router.get("/analytics/export-pdf",adminAuth,analyticsController.exportPDF);
router.get("/analytics/export-excel",adminAuth,analyticsController.exportExcel);

//DASHBOARD

router.get("/revenue-chart",adminAuth,analyticsController.getRevenueChart);
router.get("/top-products",adminAuth,analyticsController.getTopProducts);

export default router     