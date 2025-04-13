# Dental Clinic Frontend

This is the frontend application for the Dental Clinic appointment system. It's built with React and communicates with the backend API.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend server running (see backend README)

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Environment Setup

1. Create a `.env` file in the frontend directory
2. Add the following environment variables:
   ```
   REACT_APP_API_URL=http://localhost:3000/api
   ```
   Adjust the URL according to your backend server configuration

## Running the Application

1. Start the development server:
   ```bash
   npm start
   ```

2. For production build:
   ```bash
   npm run build
   ```

## Features

- User authentication (login/register)
- Appointment booking system
- View and manage appointments
- Admin dashboard for managing dentists and appointments
- Responsive design for mobile and desktop

## Default Admin Access

You can login with these default admin credentials to add a dentists:
- Email: admin@mail.com
- Password: admin
