// middlewares/multer.js

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";


// Allowed MIME types
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp"
];


// File filter (validates file type)
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};



// ================= USER PROFILE =================

const userStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "users/profile",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
});

export const uploadUser = multer({
  storage: userStorage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});



// ================= PRODUCTS =================

const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
});

export const uploadProduct = multer({
  storage: productStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});



// ================= CATEGORIES =================

const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "categories",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
});

export const uploadCategory = multer({
  storage: categoryStorage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});