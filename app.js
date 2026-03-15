import express from "express"
import dotenv from "dotenv"
import db from "./config/db.js"
import path from "path"
import session from "express-session"
import { fileURLToPath } from "url";
import userRouter from "./routes/userRouter.js"
import adminRouter from "./routes/adminRouter.js"
import passport from "./config/passport.js"
import cartMiddleware from "./middlewares/cartCount.js"
import {multerErrorHandler } from "./middlewares/multerError.js"
import { category } from "./middlewares/Categories.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
app.set("trust proxy", 1);
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({extended:true, limit: '50mb'})) 

app.use(session({
  
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 72*60*60*1000
  }
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(multerErrorHandler )

app.use((req,res,next)=>{
  res.set("cache-control","no-store")
  next() 
})

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
   
app.use(express.static(path.join(__dirname,"public")))
app.use(cartMiddleware.loadCartCount)
app.use(cartMiddleware.loadWishlistCount)
app.use(category)

db() 

const PORT = process.env.PORT

 
 
app.use("/user",userRouter)
app.use("/admin",adminRouter)   

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err.message);
    const isApiRequest = req.xhr || 
                         (req.headers.accept && req.headers.accept.includes('json')) || 
                         req.path.startsWith('/admin/') || 
                         req.path.startsWith('/user/');

    if (isApiRequest) {
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    } else {
        return res.status(err.status || 500).render("admin/error", { 
            message: err.message || "Something went wrong",
            admin: req.session.adminData ? req.session.adminData.name : null 
        });
    }
});
   
app.listen(PORT,()=>console.log("Server running..."))
      