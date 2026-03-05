import Category from "../models/categorySchema.js"

const category = async (req,res,next)=>{
  try {

    

    const categories = await Category.find({isBlocked:false})
    res.locals.category = categories
    next()
    
    
  } catch (error) {
    next(error)
  }
}

export {category}