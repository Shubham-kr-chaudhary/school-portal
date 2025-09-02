import { getPool } from '../lib/db.js';

async function init() {
  const pool = getPool();
  const create = `
  CREATE TABLE IF NOT EXISTS schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    contact VARCHAR(30),
    image TEXT,
    email_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`;
  try {
    const [res] = await pool.query(create);
    console.log('Table ensured');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

init();