require('dotenv').config();
const mysql = require("mysql2/promise");

// Create the promise-based connection pool
const pool = mysql.createPool({
 host: "localhost",
 user: process.env.DB_USER,
 password: process.env.DB_PASSWORD,
 database: process.env.DB_NAME,
 waitForConnections: true,
 connectionLimit: 10,
 queueLimit: 0,
});

// Optional: A simple test to confirm the connection is working
async function testConnection() {
 try {
  await pool.getConnection();
  console.log("MySQL Connected");
 } catch (err) {
  console.error("Database connection failed:", err.message);
 }
}

testConnection();

module.exports = pool;