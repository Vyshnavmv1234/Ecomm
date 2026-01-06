import express from "express"
import dotenv from "dotenv"
import db from "./config/db.js"
import path from "path"
import session from "express-session"
import { fileURLToPath } from "url";
import userRouter from "./routes/userRouter.js"
import passport from "./config/passport.js"



dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true})) 

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 72*60*60*1000
  }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use((req,res,next)=>{
  res.set("cache-control","no-store")
  next()
})

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname,"public")))

db() 

const PORT = process.env.PORT
 
app.use("/user",userRouter)   
  
app.listen(PORT,()=>console.log("Server running..."))
     