import { Request, Response, NextFunction, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import pool from './db';

// Login endpoint to authenticate users
export const loginHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
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
    const user = (users as any[])[0];

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
  } catch (err) {
    console.error('Login error:', err);
    next(err);
  }
};


// Check if user email or name already exists
export const checkUserExists: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name } = req.body;

    // Check for existing email
    const [emailResults] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
    
    if ((emailResults as any[]).length > 0) {
      res.status(409).json({
        status: 'error',
        message: 'Email is already taken. Please use a different email.'
      });
      return;
    }

    // Check for existing name
    const [nameResults] = await pool.query('SELECT name FROM users WHERE name = ?', [name]);

    if ((nameResults as any[]).length > 0) {
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

  } catch (err) {
    console.error('Error checking user existence:', err);
    next(err);
  }
};
