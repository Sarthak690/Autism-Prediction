const db = require("../config/connectDb");
const asyncHandler = require("express-async-handler");
const { getRankLowerBound, getCutoffLowerBound } = require("../utils/helper");
const ExcelJS = require("exceljs"); 


const searchColleges = asyncHandler(async (req, res) => {
    const { mode, community, value, certainty, courseId, courseName, courseGroup, year } = req.query;

    if (!mode || !community || !value) {
        return res.status(400).json({ message: "Missing required query parameters" });
    }

    const numValue = Number(value);
    
    if (isNaN(numValue)) {
        return res.status(400).json({ message: "Value must be a valid number" });
    }

    
    let searchValue = numValue;
    
    if (mode === "rank") {
        searchValue = getRankLowerBound(numValue, certainty);
    } else if (mode === "cutoff") {
        searchValue = getCutoffLowerBound(numValue, certainty);
    }
    
    let query = `
    SELECT 
        c.id AS coc,
        c.name AS con, 
        cr.name AS brn, 
        cr.id AS brc, 
        cc.community,
        cc.year,
        cc.min_cutoff,
        cc.max_rank
    FROM college_courses cc
    JOIN colleges c ON cc.college_id = c.id
    JOIN courses cr ON cc.course_id = cr.id
    WHERE cc.community = ?
    `;

    const params = [community];

    if (mode === "rank") {
        // Your original logic
        query += " AND cc.max_rank >= ?";
        params.push(searchValue);
    } else if (mode === "cutoff") {
        // Your original logic  
        query += " AND cc.min_cutoff <= ?";
        params.push(searchValue);
    }

    if (courseId) {
        query += " AND cr.id = ?";
        params.push(courseId);
    }

    if (courseName) {
        query += " AND LOWER(cr.name) = LOWER(?)";
        params.push(courseName);
    }

    if (courseGroup && courseGroup !== "ANY") {
        query += " AND cr.\`group\` = ?";
        params.push(courseGroup);
    }
    
    if (year) {
        query += " AND cc.year = ?";
        params.push(year);
    }

    console.log("SQL Query:", query);
    console.log("Parameters:", params);
    console.log("Original value:", numValue, "Processed value:", searchValue);

    try {
        const [results] = await db.query(query, params);

        const formatted = results.map(r => ({
            coc: r.coc,
            con: r.con, 
            brn: r.brn, 
            brc: r.brc,
            value: mode === "rank" ? r.max_rank : r.min_cutoff,
            community: r.community,
            year: r.year,
            type: mode === "rank" ? "Rank" : "Cutoff"
        }));

        res.json(formatted);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ message: "Database error", error: err.sqlMessage || err.message });
    }
    });


const downloadResultsXLSX = asyncHandler(async (req, res) => {
  const { mode, community, value, certainty, courseId, courseName, courseGroup, year } = req.query;

  
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return res.status(400).json({ message: "Value must be a valid number" });
  }

 
  let searchValue = numValue;
  if (mode === "rank") {
    searchValue = getRankLowerBound(numValue, certainty);
  } else if (mode === "cutoff") {
    searchValue = getCutoffLowerBound(numValue, certainty);
  }

  let query = `
    SELECT 
        c.id AS coc,
        c.name AS con, 
        cr.name AS brn, 
        cr.id AS brc, 
        cc.community,
        cc.year,
        cc.min_cutoff,
        cc.max_rank
    FROM college_courses cc
    JOIN colleges c ON cc.college_id = c.id
    JOIN courses cr ON cc.course_id = cr.id
    WHERE cc.community = ?
  `;

  const params = [community];

  if (mode === "rank") {
    query += " AND cc.max_rank <= ?";
    params.push(value);
  } else if (mode === "cutoff") {
    query += " AND cc.min_cutoff >= ?";
    params.push(value);
  }

  if (courseId) {
    query += " AND cr.id = ?";
    params.push(courseId);
  }

  if (courseName) {
    query += " AND LOWER(cr.name) = LOWER(?)";
    params.push(courseName);
  }

  if (courseGroup && courseGroup !== "ANY") {
    query += " AND cr.\`group\` = ?";
    params.push(courseGroup);
  }

  if (year) {
    query += " AND cc.year = ?";
    params.push(year);
  }

  const [results] = await db.query(query, params);

  if (!results.length) {
    return res.status(404).json({ message: "No results found" });
  }

  
  const data = results.map(r => ({
    counsellingCode: r.coc,
    collegeName: r.con,
    courseId: r.brc,
    courseName: r.brn,
    community: r.community,
    value: mode === "rank" ? r.max_rank : r.min_cutoff,
    year: r.year,
    type: mode === "rank" ? "Rank" : "Cutoff"
  }));

  //  Create workbook & worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("TNEA Results");

  // Add header row
  worksheet.columns = [
    { header: "Counselling Code", key: "counsellingCode", width: 20 },
    { header: "College Name", key: "collegeName", width: 40 },
    { header: "Course ID", key: "courseId", width: 15 },
    { header: "Course Name", key: "courseName", width: 25 },
    { header: "Community", key: "community", width: 15 },
    { header: mode === "rank" ? "Rank" : "Cutoff", key: "value", width: 15 },
    { header: "Year", key: "year", width: 10 },
    { header: "Type", key: "type", width: 10 }
  ];

  // Add data rows
  worksheet.addRows(data);

  //  Send file to client
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=TNEA_results.xlsx"
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  await workbook.xlsx.write(res);
  res.end();
});



module.exports = { searchColleges,downloadResultsXLSX };