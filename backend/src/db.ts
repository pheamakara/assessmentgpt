import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: Array<string | number | boolean | null>) =>
  pool.query(text, params);

export const getClient = () => pool.connect();
