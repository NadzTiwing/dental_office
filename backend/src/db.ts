import mysql, { PoolOptions } from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Log database configuration (without password)
console.log('Database Configuration:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const poolConfig: PoolOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0'),
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '30000')
};

const pool = mysql.createPool(poolConfig);

// Test the connection with retries
const maxRetries = 5;
let retryCount = 0;

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database');

    // Check users table structure
    const [tableInfo] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_KEY, EXTRA 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME]);

    console.log('Users table structure:', tableInfo);

    // Verify id column is auto-increment
    const idColumn = (tableInfo as any[]).find(col => col.COLUMN_NAME === 'id');
    if (!idColumn || idColumn.EXTRA !== 'auto_increment') {
      console.error('Warning: id column in users table is not set up as auto-increment');
    }

    connection.release();
  } catch (err) {
    console.error('Error connecting to the database:', err);
    if (retryCount < maxRetries) {
      retryCount++;
      console.log(`Retrying connection (${retryCount}/${maxRetries})...`);
      setTimeout(testConnection, 5000); // Retry after 5 seconds
    } else {
      console.error('Max retries reached. Exiting...');
      process.exit(1);
    }
  }
}

testConnection();

export default pool;
