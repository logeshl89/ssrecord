import { query } from '../db';
import bcrypt from 'bcryptjs';

async function updateAdminPassword() {
  try {
    console.log('Updating admin password...');
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('password', saltRounds);
    console.log('Generated hash:', passwordHash);
    
    // Update the user's password hash
    const result = await query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
      [passwordHash, 'admin@ssengineering.com']
    );
    
    if (result.rowCount > 0) {
      console.log('Password updated successfully for user:', result.rows[0]);
    } else {
      console.log('No user found with email: admin@ssengineering.com');
    }
  } catch (error) {
    console.error('Error updating password:', error);
  }
}

updateAdminPassword();