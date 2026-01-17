import {adminAuth,userAuth} from "../middlewares/auth.js"
import express from "express"
import adminController from "../controllers/admin/adminController.js"
import customerController from "../controllers/admin/customerController.js"
import profileController from "../controllers/user/profileController.js"
import productController from "../controllers/admin/productController.js"
import categoryController from "../controllers/admin/categoryController.js"

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

//CATEGORY MANAGEMENT

router.get("/category",adminAuth,categoryController.loadCategory)
router.get("/addCategory",adminAuth,categoryController.loadaddCategory)
router.get("/editCategory",adminAuth,categoryController.loadEditCategory) 




export default router     