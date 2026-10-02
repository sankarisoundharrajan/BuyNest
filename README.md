# 🛍️ BuyNest – Full Stack E-Commerce Website

BuyNest is a full-stack e-commerce web application developed to provide a simple, modern, and user-friendly online shopping experience. The application allows users to browse products, manage their wishlist and cart, place orders, and manage their profiles.

## 🚀 Features

* 👤 User Registration & Login
* 🛍️ Product Categories
* 🔍 Product Search
* 📦 Product Details
* ❤️ Wishlist Management
* 🛒 Shopping Cart
* 📋 Order Management
* 👤 User Profile
* 🔔 Notifications
* 📱 Responsive Design
* 🗄️ MySQL Database Integration

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MySQL

### Tools

* Visual Studio Code
* Git
* GitHub

## 📁 Project Structure

```text
BuyNest/
│
├── public/
│   ├── index.html
│   ├── categories.html
│   ├── products.html
│   ├── product.html
│   ├── wishlist.html
│   ├── cart.html
│   ├── orders.html
│   ├── profile.html
│   ├── offers.html
│   ├── video-finds.html
│   ├── login.html
│   ├── register.html
│   ├── notification.html
│   │
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       └── app.js
│
├── server.js
├── package.json
├── package-lock.json
├── .env
└── README.md
```

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/BuyNest.git
```

### 2. Open the Project

```bash
cd BuyNest
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure MySQL

Create a MySQL database:

```sql
CREATE DATABASE buynest;
```

Configure your database details in the `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=buynest
DB_PORT=3306

PORT=5000
```

### 5. Start the Server

```bash
node server.js
```

The application will run at:

```text
http://localhost:5000
```

## 🎯 Project Objective

The main objective of BuyNest is to demonstrate practical knowledge of full-stack web development by integrating frontend design, backend development, database management, API communication, and e-commerce functionality into a single application.

## 🔮 Future Enhancements

* Online payment integration
* Admin dashboard
* Product reviews and ratings
* Advanced product filtering
* Email notifications
* Order tracking
* Cloud deployment

## 👨‍💻 Developer

**Sankari Soundharrajan**

B.E. Computer Science and Engineering
Surya Engineering College, Erode, Tamil Nadu

## 📄 License

This project is developed for educational and portfolio purposes.
