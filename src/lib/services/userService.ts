import { query } from '../db';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    `SELECT id, email, name, created_at, updated_at 
     FROM users 
     WHERE email = $1`,
    [email]
  );
  
  return result.rows[0] || null;
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
  const result = await query(
    `SELECT id, email, name, created_at, updated_at 
     FROM users 
     WHERE id = $1`,
    [id]
  );
  
  return result.rows[0] || null;
}

// Create a new user
export async function createUser(input: CreateUserInput): Promise<User> {
  // Hash the password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(input.password, saltRounds);
  
  const result = await query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at, updated_at`,
    [input.email, passwordHash, input.name]
  );
  
  return result.rows[0];
}

// Authenticate user
export async function authenticateUser(input: LoginInput): Promise<User | null> {
  // Get user by email
  const user = await getUserByEmail(input.email);
  if (!user) {
    return null;
  }
  
  // Get password hash from database
  const result = await query(
    `SELECT password_hash FROM users WHERE email = $1`,
    [input.email]
  );
  
  const passwordHash = result.rows[0]?.password_hash;
  if (!passwordHash) {
    return null;
  }
  
  // Compare passwords
  const isMatch = await bcrypt.compare(input.password, passwordHash);
  if (!isMatch) {
    return null;
  }
  
  return user;
}