# StockTrack : Inventory Management System

## Overview

This Inventory Management System is a comprehensive web application built with Next.js, React, and MongoDB. It provides businesses with a robust solution for managing their inventory, sales, and purchases. The system features a user-friendly interface, real-time data updates, and secure authentication powered by Clerk.

## Features

- **Dashboard**: Get an overview of key metrics including total sales, purchases, current stock value, and low stock items.
- **Product Management**: Add, edit, and delete products with details such as name, description, price, and stock quantity.
- **Sales Management**: Record and track sales transactions, including multiple products per sale.
- **Purchase Management**: Manage purchase orders and update stock levels automatically.
- **Inventory Tracking**: Real-time updates of stock levels based on sales and purchases.
- **User Authentication**: Secure user authentication and authorization using Clerk.
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices.

## Tech Stack

- **Frontend**: Next.js 13 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ORM
- **State Management**: Redux Toolkit
- **Authentication**: Clerk
- **UI Components**: shadcn/ui
- **Charts**: Recharts

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm or yarn
- MongoDB instance (local or cloud-based)
- Clerk account for authentication

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/ajeetkumarrauniyar/StockTrack.git
   cd StockTrack
   ```

2. Install the dependencies:

   ```
   npm install
   ```

   or

   ```
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following variables:

   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. Run the development server:

   ```
   npm run dev
   ```

   or

   ```
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. **Sign Up/Sign In**: Use the authentication system powered by Clerk to create an account or sign in.
2. **Dashboard**: View key metrics and navigate to different sections of the application.
3. **Products**: Add new products, update existing ones, and manage stock levels.
4. **Sales**: Record new sales transactions, which will automatically update stock levels.
5. **Purchases**: Create purchase orders to restock inventory.
6. **Inventory**: View and manage your current inventory levels.

## API Routes

The application uses Next.js API routes for backend functionality. Here are the main API endpoints:

- `/api/products`: Manage products (GET, POST, PUT, DELETE)
- `/api/sales`: Manage sales transactions (GET, POST)
- `/api/purchases`: Manage purchase orders (GET, POST)
- `/api/inventory`: Get inventory status (GET)

## Contributing

Contributions to the Inventory Management System are welcome. Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

Your Name - contact@ajeetkumar.site

Project Link: [https://github.com/ajeetkumarrauniyar/inventory-management-system](https://github.com/ajeetkumarrauniyar/inventory-management-system)

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Clerk](https://clerk.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
