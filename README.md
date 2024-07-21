# Online aution website - Backend

Welcome to the backend of the online autioning website This project is built with Node.js, Express, and MySQL, providing a robust and scalable API for managing property listings, user authentication, and more.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- RESTful API for managing properties
- User authentication and authorization
- CRUD operations for property listings
- Search and filter functionality for properties
- Secure and scalable architecture

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14.x or higher)
- [npm](https://www.npmjs.com/)
- [MySQL](https://www.mysql.com/)

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Yohannesdejene/OnlineAuctionBackend.git
    cd OnlineAuctionBackend
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

### Database Setup

1. **Create a MySQL database:**

    ```sql
    CREATE DATABASE real_estate_app;
    ```

2. **Set up environment variables:**

    Create a `.env` file in the root directory and add the following variables:

    ```env
    PORT=5000
    DATABASE_HOST=localhost
    DATABASE_USER=root
    DATABASE_PASSWORD=<your-database-password>
    DATABASE_NAME=real_estate_app
    JWT_SECRET=<your-jwt-secret>
    ```

3. **Run the database migrations (if applicable):**

    This step depends on your setup. You might need to run a script to create the necessary tables.

    ```bash
    npm run migrate
    ```

### Running the Application

1. **Start the server:**

    ```bash
    npm start
    ```

The API will be available at [http://localhost:5000](http://localhost:3000).

## Project Structure

```bash
real-estate-backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   ├── config.js
│   └── server.js
├── .gitignore
├── package.json
├── README.md
└── .env
