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
  REDIRECT_FAILED: "Redirection failed",

  /* =========================
     AUTO-ADDED MESSAGES
  ========================== */
  ADMIN_NOT_FOUND: "Admin not found",
  INCORRECT_PASSWORD: "Incorrect Password",
  SERVER_ERROR: "Server error",
  UNAUTHORIZED: "Unauthorized",
  CATEGORY_NAME_REQUIRED: "Category name required",
  CATEGORY_IMAGE_REQUIRED: "Category image required",
  CATEGORY_ADDED_SUCCESSFULLY: "Category added successfully",
  INTERNAL_SERVER_ERROR: "Internal server error",
  NOTHING_TO_UPDATE: "Nothing to update",
  CATEGORY_UPDATED_SUCCESSFULLY: "Category updated successfully",
  DISCOUNT_MUST_BE_LESS_THAN_TWICE_MINIMUM_ORDER: "Discount must be less than twice minimum order",
  COUPON_ALREADY_EXISTS: "Coupon already exists",
  COUPON_CREATED_SUCCESSFULLY: "Coupon created successfully",
  COUPON_DISABLED: "Coupon disabled",
  COUPON_ENABLED: "Coupon enabled",
  DISCOUNT_VALUE_SHOULD_BE_LESS_THAN_HALF_THE_PRODUCT_VALUE: "Discount value should be less than half the product value",
  NO_PRODUCTS_IN_THIS_CATEGORY_SATISFY_THE_DISCOUNT_CONDITION: "No products in this category satisfy the discount condition",
  OFFER_CREATED_SUCCESSFULLY: "Offer created successfully",
  SERVER_ERROR_WHILE_ADDING_OFFER: "Server error while adding offer",
  OFFER_NOT_FOUND: "Offer not found",
  OFFER_UPDATED_SUCCESSFULLY: "Offer updated successfully",
  ORDER_NOT_FOUND: "Order not found",
  USER_HAVE_NT_PAID_YET: "User have'nt Paid yet",
  CANNOT_ROLLBACK_ORDER_STATUS: "Cannot rollback order status",
  ORDER_STATUS_UPDATED: "Order status updated",
  AT_LEAST_ONE_VARIANT_IS_REQUIRED: "At least one variant is required",
  ALL_FIELDS_MUST_BE_FILLED: "All fields must be filled",
  MINIMUM_3_IMAGES_REQUIRED: "Minimum 3 images required",
  PRODUCT_ADDED_SUCCESSFULLY: "Product added successfully",
  UNAUTHORIZED_ADMIN_ACCESS: "Unauthorized admin access",
  MINIMUM_3_IMAGES_ARE_REQUIRED: "Minimum 3 images are required",
  FAILED_TO_UPDATE_PRODUCT: "Failed to update product",
  PLEASE_SELECT_AN_IMAGE: "Please select an image",
  PROFILE_IMAGE_UPDATED_SUCCESSFULLY: "Profile image updated successfully",
  SOMETHING_WENT_WRONG: "Something went wrong",
  YOUR_CART_IS_EMPTY: "Your cart is empty ",
  INVAILD_VARIANT: "Invaild Variant",
  THIS_SIZE_IS_OUT_OF_STOCK: "This Size is Out of stock",
  STOCK_LIMIT_EXCEEDED: "Stock Limit exceeded",
  CART_NOT_FOUND: "Cart not found",
  ITEM_REMOVED_FROM_CART: "Item removed from cart",
  ITEM_NOT_FOUND: "Item not found",
  MINIMUM_QUANTITY_IS_1: "Minimum quantity is 1",
  ONE_OR_MORE_ITEMS_IN_YOUR_CART_ARE_UNAVAILABLE: "One or more items in your cart are unavailable",
  ONE_OR_MORE_ITEMS_CATEGORY_IS_UNAVAILABLE: "One or more items category is unavailable",
  ONE_OR_MORE_ITEM_IS_OUT_OF_STOCK: "One or more item is out of stock",
  INVALID_COUPON: "Invalid Coupon",
  COUPON_ALREADY_USED: "Coupon already used",
  COUPON_APPLIED_SUCCESSFULLY: "Coupon applied successfully",
  COUPON_IS_BLOCKED_BY_ADMIN: "Coupon is blocked by admin",
  ADDRESS_REQUIRED: "Address required",
  INSUFFICIENT_BALANCE: "Insufficient balance",
  COUPON_USAGE_LIMIT_REACHED: "Coupon usage limit reached",
  ITEM_ALREADY_CANCELLED: "Item already cancelled",
  USER_WITH_THIS_EMAIL_NOT_FOUND: "User with this email not found",
  FAILED_TO_SEND_OTP: "Failed to send OTP",
  INVALID_OTP: "Invalid OTP",
  OTP_VERIFIED: "OTP verified",
  VERIFICATION_FAILED: "Verification failed",
  ERROR_SENDING_MAIL: "Error sending mail",
  FAILED_TO_RESEND_OTP: "Failed to resend OTP",
  OTP_RESENT_SUCCESSFULLY: "OTP resent successfully",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match",
  USER_DOESNT_EXISTS: "User doesnt exists",
  LOGIN_FAILED_PLEASE_TRY_AGAIN_LATER: "Login failed. Please try again later",
  FAILED_TO_RESENT: "Failed to resent",
  SERVER_ERROR_WHILE_RESENDING_OTP: "Server error while resending OTP",
  SESSION_EXPIRED_OR_UNAUTHORIZED_PLEASE_LOGIN_AGAIN: "Session expired or unauthorized. Please login again.",
  ADMIN_PRIVILEGES_REQUIRED: "Admin privileges required.",
  AUTHENTICATION_SERVER_ERROR: "Authentication server error.",
  FILE_SIZE_TOO_LARGE: "File size too large",
};

export default ERROR_MESSAGES;
