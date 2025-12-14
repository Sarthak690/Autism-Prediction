const fs = require("fs");
const path = require("path");
const db = require("../config/connectDb");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");

// ========== ADMIN LOGIN ==========
const adminLogin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM admin WHERE username = ?";
    
    const [results] = await db.query(sql, [username]);
    
    if (results.length === 0) {
        return res.status(401).json({ message: "Invalid username" });
    }
    
    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
    }
    
    return res.status(200).json({ message: "Admin login successful" });
});

// ========== UPLOAD JSON ==========
const uploadJsonData = asyncHandler(async (req, res) => {
  try {
    console.log("Uploaded file info:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;

    try {
      const rawData = fs.readFileSync(filePath, "utf-8");
      const jsonData = JSON.parse(rawData);

      if (!Array.isArray(jsonData)) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({ message: "Invalid JSON format." });
      }

      const fileName = path.basename(filePath);
      const matches = fileName.match(/\d{4}/g);
      const year = matches && matches.length > 0 
            ? parseInt(matches[matches.length - 1])
            : new Date().getFullYear();
      const fileType = fileName.toLowerCase().includes('rank') ? 'Rank' : 'Cutoff';
      
      const courseGroups = {
            'CS Related': [
                'CS', 'CM', 'IT', 'AD', 'AL', 'AM', 'CF', 'CI', 'CD', 'SC', 'SE', 'SB', 'CB', 'CW', 'CG', 'TS', 'CT','IM','CY','AT'
            ],
            'Core Related': [
                'ME', 'CE', 'EE', 'EC', 'CH', 'AU', 'EI', 'IC', 'PR', 'PE', 'MT', 'MN',
                'MI', 'MF', 'MS', 'MO', 'MG', 'MC', 'MB', 'IN', 'IE','EA','EF','EL','EM',"ES",'ET','EV','EX','EY',
            ]
        };

      for (const item of jsonData) {
        const collegeId = item.coc;
        const collegeName = item.con;
        const courseId = item.brc;
        const courseName = item.brn;

        // Determine the course group based on the courseId
        let courseGroup = 'Other'; 
        if (courseGroups['CS Related'].includes(courseId)) {
            courseGroup = 'CS Related';
        } else if (courseGroups['Core Related'].includes(courseId)) {
            courseGroup = 'Core Related';
        }

        // Insert College & Course
        await db.query("INSERT IGNORE INTO colleges (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)", [collegeId, collegeName]);
        await db.query("INSERT IGNORE INTO courses (id, name,`group`) VALUES (?, ?,?) ON DUPLICATE KEY UPDATE name=VALUES(name), `group`=VALUES(`group`)", [courseId, courseName, courseGroup]);

        // Communities
        const communities = ["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"];
        for (const community of communities) {
          const value = item[community];
          if (value !== "" && value !== undefined) {
            // ✅ FIXED: Use the same ID regardless of data type
            const collegeCourseId = `${collegeId}_${courseId}_${community}_${year}`;
            
            if (fileType === 'Cutoff') {
              // ✅ Insert or update with cutoff data
              await db.query(
                `INSERT INTO college_courses 
                 (college_course_id, college_id, course_id, community, year, min_cutoff, max_rank) 
                 VALUES (?, ?, ?, ?, ?, ?, NULL)
                 ON DUPLICATE KEY UPDATE 
                 min_cutoff = VALUES(min_cutoff)`,
                [collegeCourseId, collegeId, courseId, community, year, value]
              );
            } else if (fileType === 'Rank') {
              // ✅ Insert or update with rank data
              await db.query(
                `INSERT INTO college_courses 
                 (college_course_id, college_id, course_id, community, year, min_cutoff, max_rank) 
                 VALUES (?, ?, ?, ?, ?, NULL, ?)
                 ON DUPLICATE KEY UPDATE 
                 max_rank = VALUES(max_rank)`,
                [collegeCourseId, collegeId, courseId, community, year, value]
              );
            }
          }
        }
      }

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(200).json({ message: "Upload successful" });

    } catch (err) {
      console.error("Error processing JSON upload:", err);
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(500).json({ message: "Failed to process file", error: err.sqlMessage || err.message });
    }

  } catch (fatalErr) {
    console.error("Fatal Upload Error:", fatalErr);
    return res.status(500).json({ error: fatalErr.message });
  }
});

// ========== GET COLLEGE COURSES ==========
const getCollegeCourses = asyncHandler(async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        cc.college_id as coc,
        c.name as con,
        cc.course_id as brc,
        cr.name as brn,
        cc.community,
        cc.min_cutoff,
        cc.max_rank,
        cc.year
      FROM college_courses cc
      JOIN colleges c ON cc.college_id = c.id
      JOIN courses cr ON cc.course_id = cr.id
      ORDER BY cc.year DESC
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching college courses:", err);
    res.status(500).json({ message: "Failed to fetch data", error: err.message });
  }
});

module.exports = {
  adminLogin,
  uploadJsonData,
  getCollegeCourses  
};