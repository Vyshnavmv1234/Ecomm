// middlewares/multer.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const userStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "users/profile",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
});

const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    
  }
});

const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "categories",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
})


export const uploadUser = multer({ storage: userStorage });
export const uploadProduct = multer({ storage: productStorage });
export const uploadCategory = multer({ storage: categoryStorage })
