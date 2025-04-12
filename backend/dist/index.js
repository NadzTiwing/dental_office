import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import bcrypt from 'bcrypt';
import { loginHandler } from './auth.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
console.log('Starting server...');
// Middleware
app.use(cors());
app.use(express.json());
// Test endpoint
// Test endpoint
app.get('/api/test', (req, res) => {
    console.log('Test endpoint hit at:', new Date().toISOString());
    res.json({
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});
// Function to create admin user if it doesn't exist
async function createAdminIfNotExists() {
    try {
        const [existingAdmin] = await pool.query('SELECT * FROM users WHERE email = ?', ['admin@mail.com']);
        if (!existingAdmin.length) {
            const hashedPassword = await bcrypt.hash('admin', 10);
            await pool.query('INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)', ['admin', 'admin@mail.com', hashedPassword, true]);
            console.log('Admin user created successfully');
        }
    }
    catch (err) {
        console.error('Error creating admin user:', err);
    }
}
// Routes
app.get('/api/db-check', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT NOW() AS time');
        res.json({ status: 'connected', time: rows[0].time });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});
// Create admin user when server starts
createAdminIfNotExists();
// Auth routes
app.post('/api/login', loginHandler);
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET  /api/test');
    console.log('- GET  /api/db-check');
    console.log('- POST /api/login');
});
