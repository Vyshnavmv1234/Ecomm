import userController from "../controllers/user/userController.js"
import express from "express"
const router = express.Router()

router.get("/homepage",userController.loadHomepage)
router.get("/pageNotFound",userController.pageNotFound)
router.get("/signup",userController.loadSignup)
router.post("/signup",userController.signup)

export default router