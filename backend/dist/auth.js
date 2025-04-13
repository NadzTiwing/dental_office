import bcrypt from 'bcryptjs';
import pool from './db.js';
// Login endpoint to authenticate users
export const loginHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;
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
                message: 'No user found. Sign up first.'
            });
            return;
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({
                status: 'error',
                message: 'Wrong password'
            });
            return;
        }
        const { password: _, ...userData } = user;
        res.json({
            status: 'success',
            data: userData,
            isAdmin: user.is_admin
        });
    }
    catch (err) {
        console.error('Login error:', err);
        next(err);
    }
};
// Check if user email or name already exists
export const checkUserExists = async (req, res, next) => {
    try {
        const { email, name } = req.body;
        // Check for existing email
        const [emailResults] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        if (emailResults.length > 0) {
            res.status(409).json({
                status: 'error',
                message: 'Email is already taken. Please use a different email.'
            });
            return;
        }
        // Check for existing name
        const [nameResults] = await pool.query('SELECT name FROM users WHERE name = ?', [name]);
        if (nameResults.length > 0) {
            res.status(409).json({
                status: 'error',
                message: 'Name is already taken. Please create a different name.'
            });
            return;
        }
        // If no conflicts found
        res.json({
            status: 'success'
        });
    }
    catch (err) {
        console.error('Error checking user existence:', err);
        next(err);
    }
};
//# sourceMappingURL=auth.js.map