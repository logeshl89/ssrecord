import { testConnection } from './db';
import runMigrations from './migrations/runMigrations';

async function testDbSetup() {
  console.log('Testing database connection...');
  
  // Test the connection
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('Failed to connect to the database');
    process.exit(1);
  }
  
  console.log('Database connection successful!');
  
  // Run migrations
  try {
    await runMigrations();
    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Failed to run migrations:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

testDbSetup();