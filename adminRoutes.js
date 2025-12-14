const express = require("express");
const router = express.Router();
const { adminLogin, uploadJsonData,getCollegeCourses } = require("../controllers/adminController");
const upload = require("../middleware/uploadMiddleware");

router.post("/login", adminLogin);
router.post("/uploads",upload.single("jsonfile"),uploadJsonData)
router.get("/college-courses", getCollegeCourses);
module.exports = router;
