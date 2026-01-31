const ERROR_MESSAGES = {

  /* =========================
     COMMON / GLOBAL
  ========================== */
  INTERNAL_ERROR: "Something went wrong. Please try again later.",
  PAGE_NOT_FOUND: "Requested page not found",
  INVALID_REQUEST: "Invalid request",
  UNAUTHORIZED_ACCESS: "Unauthorized access",
  FORBIDDEN_ACCESS: "You do not have permission to access this resource",

  /* =========================
     SESSION / AUTH
  ========================== */
  SESSION_EXPIRED: "Session expired. Please login again.",
  ADMIN_NOT_AUTHORIZED: "Admin not authorized",
  USER_NOT_AUTHORIZED: "User not authorized",
  LOGIN_REQUIRED: "Please login to continue",
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_BLOCKED: "Your account has been blocked",
  ACCOUNT_NOT_FOUND: "Account not found",

  /* =========================
     ADMIN AUTH
  ========================== */
  ADMIN_LOGIN_FAILED: "Admin login failed",
  ADMIN_LOGOUT_FAILED: "Admin logout failed",

  /* =========================
     CATEGORY MANAGEMENT
  ========================== */
  CATEGORY_LOAD_FAILED: "Failed to load categories",
  CATEGORY_NOT_FOUND: "Category not found",
  CATEGORY_ALREADY_EXISTS: "Category already exists",
  CATEGORY_CREATE_FAILED: "Failed to create category",
  CATEGORY_UPDATE_FAILED: "Failed to update category",
  CATEGORY_DELETE_FAILED: "Failed to delete category",
  CATEGORY_BLOCK_FAILED: "Failed to block category",
  CATEGORY_UNBLOCK_FAILED: "Failed to unblock category",
  INVALID_CATEGORY_ID: "Invalid category ID",

  /* =========================
     PRODUCT MANAGEMENT
  ========================== */
  PRODUCT_LOAD_FAILED: "Failed to load products",
  PRODUCT_NOT_FOUND: "Product not found",
  PRODUCT_CREATE_FAILED: "Failed to add product",
  PRODUCT_UPDATE_FAILED: "Failed to update product",
  PRODUCT_DELETE_FAILED: "Failed to delete product",
  PRODUCT_BLOCKED: "This product is not available",
  PRODUCT_OUT_OF_STOCK: "Product is out of stock",
  PRODUCT_IMAGE_REQUIRED: "Minimum required product images not uploaded",
  PRODUCT_IMAGE_UPLOAD_FAILED: "Failed to upload product images",

  /* =========================
     IMAGE / FILE UPLOAD
  ========================== */
  IMAGE_UPLOAD_FAILED: "Image upload failed",
  INVALID_IMAGE_FORMAT: "Invalid image format",
  IMAGE_SIZE_EXCEEDED: "Image size exceeds allowed limit",

  /* =========================
     USER / CUSTOMER MANAGEMENT
  ========================== */
  USER_LOAD_FAILED: "Failed to load users",
  USER_NOT_FOUND: "User not found",
  USER_BLOCK_FAILED: "Failed to block user",
  USER_UNBLOCK_FAILED: "Failed to unblock user",

  /* =========================
     PASSWORD / OTP
  ========================== */
  OTP_SEND_FAILED: "Failed to send OTP",
  OTP_EXPIRED: "OTP expired",
  OTP_INVALID: "Invalid OTP",
  PASSWORD_RESET_FAILED: "Password reset failed",
  PASSWORD_MISMATCH: "Passwords do not match",

  /* =========================
     SEARCH / FILTER / PAGINATION
  ========================== */
  SEARCH_FAILED: "Search operation failed",
  FILTER_FAILED: "Filter operation failed",
  PAGINATION_FAILED: "Pagination failed",

  /* =========================
     ROUTE / NAVIGATION
  ========================== */
  ROUTE_ACCESS_DENIED: "Access to this route is denied",
  REDIRECT_FAILED: "Redirection failed"
};

export default ERROR_MESSAGES;
