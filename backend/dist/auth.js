import bcrypt from 'bcrypt';
import pool from './db.js';
// Login endpoint to authenticate users
export const loginHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt received:", { email });
        if (!email || !password) {
            res.status(400).json({
                status: 'error',
                message: 'Email and password are required'
            });
            return;
        }
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];
        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
            return;
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
            return;
        }
        const { password: _, ...userData } = user;
        res.json({
            status: 'success',
            data: userData
        });
    }
    catch (err) {
        console.error('Login error:', err);
        next(err);
    }
};
