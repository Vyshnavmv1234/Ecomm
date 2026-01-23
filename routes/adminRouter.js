import {adminAuth} from "../middlewares/auth.js"
import express from "express"
import adminController from "../controllers/admin/adminController.js"
import customerController from "../controllers/admin/customerController.js"
import productController from "../controllers/admin/productController.js"
import categoryController from "../controllers/admin/categoryController.js"
import { uploadProduct } from "../middlewares/multer.js"

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
router.post("/addProduct",uploadProduct.array("images", 5),adminAuth,productController.postAddProducts)

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
router.patch("/category/update/:id",adminAuth,categoryController.updateCategory)





export default router     