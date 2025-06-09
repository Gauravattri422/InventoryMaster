# Inventory Manager

A full-stack inventory management web app with user authentication, order/product tracking, sorting, filtering, and a modern dark mode UI powered by Tailwind CSS.

---

## Features

- User Signup and Login with JWT-based authentication
- Secure password hashing with bcrypt
- Dashboard with CRUD operations on orders/products
- Order fields: `orderId`, `productId`, `orderDate`, `quantity`, `price`
- Sorting and filtering (min/max) on all fields
- Responsive UI with Tailwind CSS dark mode
- Hover effects and smooth UI interactions
- Backend built with Node.js, Express, and MongoDB (Mongoose)
- Frontend is a single `index.html` file with embedded JavaScript and Tailwind CDN

---

## Project Structure

- `server.js` — Node.js/Express backend API server
- `index.html` — Frontend UI with Tailwind CSS and JavaScript
- `.env` — Environment variables (MongoDB URI, JWT secret, etc.)

---

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB database (can use Railway MongoDB plugin or MongoDB Atlas)
- Git (optional, for deployment)
- Modern browser (Chrome, Firefox, Edge)

### Installation

1. Clone the repo or download project files

2. Install backend dependencies:

   ```bash
   npm install

