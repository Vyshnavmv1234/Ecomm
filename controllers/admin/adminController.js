import User from "../../models/userSchema.js"
import bcrypt from "bcrypt"

const loadLogin = async (req,res)=>{
  try {

   if(req.session.admin){
    return res.redirect("/admin/adminDashboard")
   }
    return res.render("admin/adminLogin",{message:null})
    
  } catch (error) {
    console.log("error loading admin Login",error)
    res.redirect("/admin/pageNotFound")
  }
}

const postLogin = async(req,res)=>{
  try {
  const { email, password } = req.body;

  const findAdmin = await User.findOne({ email, isAdmin: true });
  
  if (!findAdmin) {
    return res.render("admin/adminLogin",{message:"Admin not found"}) 
  }
  req.session.adminData = findAdmin

  const passwordMatch = await bcrypt.compare(password, findAdmin.password);

  if (!passwordMatch) {
    return res.render("admin/adminLogin",{message:"Incorrect Password"});
  }

  req.session.admin = true;
  console.log("admin logged in");
  return res.redirect("/admin/adminDashboard");

} catch (error) {
  console.error("Login error:", error);
  res.redirect("/admin/pageNotFound")
 }
}

const loadDashboard = async (req,res)=>{
  try {  

    if(req.session.admin){
     
    return  res.render("admin/adminDashboard",{admin:req.session.adminData.name})
  }
  return res.redirect("/admin/adminLogin")
    
  } catch (error) {
    console.log("Loading Dashboard error",error)
    res.redirect("/admin/pageNotFound")
  }
}

const pageNotFound = async(req,res)=>{
  res.render("admin/error")
}

const logout = async(req,res)=>{
  try {

    if(req.session.user){
      req.session.admin = null
      return res.redirect("/admin/adminLogin") 
    }else{
      req.session.destroy((err)=>{
      if(err){
        console.log("Error while Loggin out",err)
        res.redirect("/admin/pageNotFound")
      }
      res.clearCookie("connect.sid");
     return res.redirect("/admin/adminLogin") 
    })
    }
    
  } catch (error) {
    console.log("error logout",error)
    res.redirect("/admin/pageNotFound")
  }
}

export default {loadLogin,postLogin,loadDashboard,pageNotFound,logout} 