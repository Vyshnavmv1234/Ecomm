import category from "../../models/categorySchema.js"

const loadCategory = async (req,res)=>{
  try {

    if(req.session.admin){
      res.render("admin/categoryManagement",{admin:null})
    }
    
  } catch (error) {
    
  }
}
const loadaddCategory = async (req,res)=>{
  try {

    if(req.session.admin){
      res.render("admin/addCategory",{admin:null})
    }
    
  } catch (error) {
    
  }
}
const loadEditCategory = async (req,res)=>{
  try {

    if(req.session.admin){
      res.render("admin/addCategory",{admin:null})
    }
    
  } catch (error) {
    
  }
}

export default {loadCategory,loadaddCategory,loadEditCategory}