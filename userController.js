const db = require("../config/connectDb");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");

const registerUser = asyncHandler(async (req, res) => {
    const { email, password, cutoff, rank } = req.body;

    if (!email || !password || cutoff === undefined || rank === undefined) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const checkSql = "SELECT * FROM users WHERE email = ?";
        const [results] = await db.query(checkSql, [email]); // ✅ Use async/await

        if (results.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertSql = "INSERT INTO users (email, password, cutoff, rank) VALUES (?, ?, ?, ?)";
        await db.query(insertSql, [email, hashedPassword, cutoff, rank]); // ✅ Use async/await

        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration error:", error); // Log the error for debugging
        return res.status(500).json({ message: "Registration failed", error: error.sqlMessage || error.message });
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    try {
        const sql = "SELECT * FROM users WHERE email = ?";
        const [results] = await db.query(sql, [email]); // ✅ Use async/await

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        return res.json({ message: "Login successful", user: { email: user.email, cutoff: user.cutoff, rank: user.rank } });
    } catch (error) {
        console.error("Login error:", error); // Log the error for debugging
        return res.status(500).json({ message: "Login failed", error: error.sqlMessage || error.message });
    }
});

module.exports = { registerUser, loginUser };