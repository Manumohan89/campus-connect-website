const { Pool } = require('pg');
require('dotenv').config();

let poolConfig;

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    min: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: false,
  };
} else {
  poolConfig = {
    user:     process.env.DB_USER     || 'postgres',
    host:     process.env.DB_HOST     || 'localhost',
    database: process.env.DB_NAME     || 'CampusConnect',
    password: process.env.DB_PASSWORD || '',
    port:     parseInt(process.env.DB_PORT || '5432', 10),
    max: 8,
    min: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    console.error('   Full error:', err);
    console.error('   Config:', {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'CampusConnect',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      hasPassword: !!(process.env.DB_PASSWORD),
    });
  } else {
    release();
    console.log('✅ PostgreSQL connected successfully');
  }
});

module.exports = pool;
