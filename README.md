# WestLane

WestLane is a full-stack e-commerce web application built for an online fashion and clothing store. It provides a complete shopping experience for users and a robust management dashboard for administrators.

## 🚀 Features

### User Panel
*   **Authentication:** Email/password signup with OTP verification, and Google OAuth integration.
*   **Shopping Experience:** Browse products by category, view detailed product pages with size variants and image carousels.
*   **Cart & Wishlist:** Manage desired items, check stock availability, and smoothly transition items from wishlist to cart.
*   **Checkout Flow:** Secure checkout process supporting Cash on Delivery (COD), Online Payment (Razorpay), and Wallet payments.
*   **Order Management:** View order history, download PDF invoices, cancel orders/items, and request returns.
*   **User Profile:** Manage personal details, update email/password (with OTP security), manage multiple delivery addresses, and view wallet balance.
*   **Coupons:** Apply discount coupons during checkout.

### Admin Panel
*   **Dashboard:** Comprehensive overview of sales, revenue charts, and top-selling products.
*   **Product Management:** Full CRUD operations for products, including support for multiple images (stored via Cloudinary) and size variants.
*   **Category Management:** Organize products into categories with the ability to soft-block/unblock them.
*   **Order Management:** Track all orders, update fulfillment statuses, and process return/cancellation requests.
*   **User Management:** View customer details and manage account access (block/unblock users).
*   **Marketing Tools:** Create and manage discount coupons and promotional offers (product-level or category-level).
*   **Sales Analytics:** Generate customized sales reports with options to export data as PDF or Excel files.

## 🛠️ Technology Stack

*   **Backend:** Node.js, Express.js (v5)
*   **Database:** MongoDB, Mongoose (v9)
*   **Templating Engine:** EJS (v3)
*   **Authentication:** express-session, Passport.js (Google OAuth 2.0), bcrypt (v6)
*   **File Uploads:** Multer, multer-storage-cloudinary, Cloudinary
*   **Payment Gateway:** Razorpay
*   **Email Service:** Nodemailer (for OTPs)
*   **Utilities:** PDFKit (invoices), ExcelJS (analytics), Moment.js (date formatting)

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:
*   [Node.js](https://nodejs.org/) installed (v18+ recommended)
*   [MongoDB](https://www.mongodb.com/) installed locally or a MongoDB Atlas connection string
*   A [Cloudinary](https://cloudinary.com/) account for image hosting
*   A [Razorpay](https://razorpay.com/) account for payment processing
*   A Google Cloud Console project for OAuth credentials
*   An email account configured for sending emails (e.g., Gmail with App Passwords)

## 💻 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/WestLane.git
    cd WestLane
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add the following variables:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    SESSION_SECRET=your_secure_session_secret
    
    # Google OAuth
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    
    # Razorpay
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    
    # Nodemailer
    EMAIL_USER=your_email_address
    EMAIL_PASS=your_email_app_password
    ```

4.  **Start the server:**
    ```bash
    npm start
    ```
    The application will be accessible at `http://localhost:3000` (or your configured `PORT`).

## 📁 Project Structure

*   `app.js`: Application entry point and server setup.
*   `/config`: Database, Passport, and Cloudinary configurations.
*   `/controllers`: Application logic separated into `admin` and `user` directories.
*   `/models`: Mongoose database schemas.
*   `/routes`: Express route definitions for `adminRouter` and `userRouter`.
*   `/middlewares`: Custom middleware for authentication, file uploads, etc.
*   `/views`: EJS templates for rendering the UI.
*   `/public`: Static assets like CSS, client-side JavaScript, and images.
*   `/utitls`: Reusable utility constants (status codes, error messages).

## 📄 License

This project is licensed under the ISC License.
