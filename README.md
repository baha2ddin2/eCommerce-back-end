# eCommerce Project - Back End

This is the backend for an eCommerce application built with Node.js, Express, and MySQL. It provides RESTful APIs for user management, authentication, product catalog, cart, orders, reviews, and image uploads.

## Features

- User registration, login, authentication (JWT & cookies)
- Admin and user roles with protected routes
- Product CRUD with image upload (Cloudinary)
- Cart and order management
- Product reviews
- Password reset via email (nodemailer)
- Input validation (Joi)
- Secure HTTP headers (Helmet)
- CORS support

## Project Structure

```
.
├── app.js
├── package.json
├── .env
├── database/
│   └── db.js
├── images/
├── middlewars/
│   ├── checktoken.js
│   ├── error.js
│   └── photoUpload.js
├── routes/
│   ├── cart.js
│   ├── login.js
│   ├── orderItem.js
│   ├── orders.js
│   ├── password.js
│   ├── product.js
│   ├── reviews.js
│   └── users.js
├── schema/
│   ├── cart.js
│   ├── login.js
│   ├── order.js
│   ├── orderItem.js
│   ├── password.js
│   ├── product.js
│   ├── review.js
│   └── user.js
└── utils/
    └── cloudinary.js
```

## Getting Started

### Prerequisites

- Node.js
- MySQL database
- Cloudinary account (for image uploads)
- Gmail account (for password reset emails)

### Installation

1. Clone the repository:
    ```sh
    git clone <your-repo-url>
    cd back-end-eCommerce
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add your environment variables:
    ```
    PORT=5000
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=your_db_name
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloudinary_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    USER_MAIL=your_gmail_address
    USER_PASS=your_gmail_app_password
    ```

4. Start the server:
    ```sh
    node app.js
    ```

## API Endpoints

- **Users:** `/api/users`
- **Login:** `/login`
- **Products:** `/api/products`
- **Cart:** `/api/cart`
- **Orders:** `/api/orders`
- **Order Items:** `/api/orderItem`
- **Reviews:** `/api/reviews`
- **Password Reset:** `/api/password`

Refer to the route files in the [`routes/`](routes/) directory for detailed endpoint documentation.

## Notes

- Make sure your MySQL database is set up with the required tables.
- For production, set `secure: true` for cookies and use HTTPS.
- Image uploads are handled via Cloudinary; local images are stored temporarily in the `images/