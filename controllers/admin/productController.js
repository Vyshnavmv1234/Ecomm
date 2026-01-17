import products from "../../models/productSchema.js"

const loadProducts = async(req,res)=>{
  try {

    if(req.session.admin){
      res.render("admin/productManagement",{admin:req.session.adminData.name})
    }
    
  } catch (error) {
    
  }
}

export default {loadProducts}