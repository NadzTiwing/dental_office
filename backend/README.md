# Dental Clinic Backend

This is the backend API server for the Dental Clinic appointment system. It's built with Express.js and uses MySQL for data storage.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher) 
- MySQL (v8.0 or higher)

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Database Setup

1. Create the MySQL database:
   ```bash
   mysql -u your_username -p
   CREATE DATABASE dental_clinic_db;
   exit;
   ```

2. Run the SQL scripts from the sql folder to create all required tables:


## Environment Setup

1. Create a `.env` file in the backend directory
2. Add the following environment variables:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=dental_clinic_db
   DB_PORT=3306
   DB_WAIT_FOR_CONNECTIONS=true
   DB_CONNECTION_LIMIT=10
   DB_QUEUE_LIMIT=0
   DB_CONNECT_TIMEOUT=30000
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. For production build:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration

### Users
- POST `/api/users` - Create new user
- PUT `/api/users/:id` - Update user details

### Default Admin Account
The system comes with a default admin account:
- Email: admin@mail.com
- Password: admin

## Error Handling

The application includes comprehensive error handling:
- Database connection errors with retry mechanism
- Input validation
- Duplicate email checking
- Password hashing
- SQL injection prevention

## Security Features

- Password hashing using bcrypt
- Email format validation
- Required field validation
- Unique email enforcement
- Admin access control
