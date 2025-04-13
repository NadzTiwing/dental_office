import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool from './db.js';
import { loginHandler, checkUserExists } from './auth.js';
import { registerUser, updateUserDetails, addAppointment, rescheduleAppointment, cancelAppointment, getDentists, addDentist, deleteDentist, getUserAppointments, getAllAppointments } from './users.js';
dotenv.config();
const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
// Basic middleware
app.use(cors());
app.use(express.json());
// Test endpoint
app.get('/api/test', (req, res) => {
    console.log('Test endpoint hit');
    res.json({
        status: 'success',
        message: 'API is working!'
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
// Auth routes
app.post('/api/login', loginHandler);
app.post('/api/check-user', checkUserExists);
app.post('/api/register', registerUser);
app.put('/api/update-user/:id', updateUserDetails);
app.post('/api/add-appointment', addAppointment);
app.put('/api/reschedule-appointment', rescheduleAppointment);
app.put('/api/cancel-appointment', cancelAppointment);
app.get('/api/dentists', getDentists);
app.post('/api/add-dentist', addDentist);
app.delete('/api/delete-dentist/:id', deleteDentist);
app.get('/api/user-appointments/:userId', getUserAppointments);
app.get('/api/all-appointments', getAllAppointments);
// Create admin user when server starts
createAdminIfNotExists();
// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the API at http://localhost:${PORT}`);
    console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
}).on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
});
// Error handling
process.on('uncaughtException', (err) => {
    console.error('\n=== UNCAUGHT EXCEPTION ===', err);
    server.close(() => process.exit(1));
});
process.on('unhandledRejection', (err) => {
    console.error('\n=== UNHANDLED REJECTION ===', err);
    server.close(() => process.exit(1));
});
//# sourceMappingURL=index.js.map