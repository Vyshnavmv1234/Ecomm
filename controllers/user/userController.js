import User from "../../models/userSchema.js"
const pageNotFound = async (req,res)=>{
  try {

    res.render("user/error")

  } catch (error) {
    res.redirect("/pageNotFound")
  }
}

const loadHomepage = async (req,res)=>{
  try {

    return res.render("user/userHome")
    
  } catch (error) {
    console.log("Homepage not found")
    res.status(500).send("Server error")
  }
}
const loadSignup = async (req,res)=>{
  try {

    return res.render("user/userSignup")
  
  } catch (error) {
    console.log("Signup page not found")
    res.status(500).send("Server error")
  }
}
const signup = async (req,res)=>{
  const {name,email,password,phone} = req.body
  try {

    const newUser = new User({name,email,password,phone})
    await newUser.save()
    console.log(newUser)
    return res.redirect("/user/signup")

  } catch (error) {
    
    console.error("Error occured while saving user",error)
    res.status(500).send('Internal error')
  }
}

export default {loadHomepage,pageNotFound,loadSignup,signup}