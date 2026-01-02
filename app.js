import express from "express"
import dotenv from "dotenv"
import db from "./config/db.js"

dotenv.config()

const app = express()

db()

const PORT = process.env.PORT

app.get("/",(req,res)=>{
  
})

app.listen(PORT,()=>console.log("Server running..."))
