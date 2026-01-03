
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

export default {loadHomepage,pageNotFound}