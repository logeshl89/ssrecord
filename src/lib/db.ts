import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test the database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Generic query function
export async function query(text: string, params?: any[]): Promise<QueryResult<any>> {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

// Get a client from the pool for transactions
export async function getClient() {
  return await pool.connect();
}

// Close all connections in the pool
export async function closePool() {
  await pool.end();
}

export default pool;