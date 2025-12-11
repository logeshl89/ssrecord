#!/usr/bin/env node
import runMigrations from './src/lib/migrations/runMigrations';

async function initDb() {
  try {
    console.log('Initializing database...');
    await runMigrations();
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initDb();