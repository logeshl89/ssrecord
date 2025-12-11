import { query } from '../db';
import * as fs from 'fs';
import * as path from 'path';

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Create migrations table to track which migrations have been run
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get list of migration files
    const migrationsDir = path.join(__dirname);
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && file !== 'runMigrations.ts')
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Get already executed migrations
    const executedMigrationsResult = await query('SELECT name FROM migrations ORDER BY name');
    const executedMigrations = executedMigrationsResult.rows.map(row => row.name);
    
    // Run pending migrations
    for (const migrationFile of migrationFiles) {
      if (!executedMigrations.includes(migrationFile)) {
        console.log(`Running migration: ${migrationFile}`);
        
        const migrationPath = path.join(migrationsDir, migrationFile);
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        // Split the migration SQL into statements (handling multiple statements in one file)
        const statements = migrationSql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);
        
        try {
          // Execute each statement in the migration
          for (const statement of statements) {
            if (statement.trim().length > 0) {
              await query(statement);
            }
          }
          
          // Record that this migration has been executed
          await query('INSERT INTO migrations (name) VALUES ($1)', [migrationFile]);
          
          console.log(`Successfully executed migration: ${migrationFile}`);
        } catch (error) {
          console.error(`Failed to execute migration ${migrationFile}:`, error);
          throw error;
        }
      } else {
        console.log(`Migration already executed: ${migrationFile}`);
      }
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations().then(() => {
    process.exit(0);
  });
}

export default runMigrations;