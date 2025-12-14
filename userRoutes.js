const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const db = require("../config/connectDb");
const {searchColleges,downloadResultsXLSX}  = require("../controllers/resultController");
const { registerUser, loginUser } = require("../controllers/userController");

// User registration
router.post("/register", registerUser);
// User Login
router.post("/login",loginUser);

// User search
router.get("/search", searchColleges);
router.get("/download/xlsx", downloadResultsXLSX); 

// Fetch all courses
router.get("/courses", asyncHandler(async (req, res) => {
  const [rows] = await db.query("SELECT id, name FROM courses ORDER BY id ASC");
  res.json(rows);
}));

module.exports = router;
