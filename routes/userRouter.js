import userController from "../controllers/user/userController.js"
import express from "express"
const router = express.Router()

router.get("/homepage",userController.loadHomepage)
router.get("/pageNotFound",userController.pageNotFound)

export default router