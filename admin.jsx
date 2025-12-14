import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './admin.css';

const apiUrl = process.env.REACT_APP_API_URL;

const UploadJson = () => {
  const [file, setFile] = useState(null);
  const [uploadResponse, setUploadResponse] = useState('');
  const [dbData, setDbData] = useState([]);
  const[page,setPage]=useState(1);
  const perPage=10;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const fetchDbData = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/admin/college-courses`);
      setDbData(res.data);
      setPage(1);
    } catch (err) {
      console.error("Error fetching DB data", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a JSON file.');
      return;
    }

    const formData = new FormData();
    formData.append('jsonfile', file);

    try {
      const res = await axios.post(`${apiUrl}/api/admin/uploads`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResponse(res.data.message || 'Upload successful');

      // Fetch updated DB data after upload
      fetchDbData();
    } catch (err) {
      setUploadResponse('Error uploading file');
      console.log(err);
    }
  };

  // Load existing data on page load
  useEffect(() => {
    fetchDbData();
  }, []);


  const paginated = dbData.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(dbData.length / perPage);


  return (
    <div className="Uploadjson-container">
      <h2 className='Uploadjson-Form'>Upload JSON File (Cutoff or Rank)</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".json" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>

      {uploadResponse && <p>{uploadResponse}</p>}

      {dbData.length > 0 && (
        <div className="college-course-table">
          <h3>College Courses from DB</h3>
          <table border="1">
            <thead>
              <tr>
                <th>College Code</th>
                <th>College</th>
                <th>Course Code</th>
                <th>Course</th>
                <th>Community</th>
                <th>Min Cutoff</th>
                <th>Max Rank</th>
                <th>Year</th>
                
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, index) => (
                <tr key={index}>
                  <td>{row.coc}</td>
                  <td>{row.con}</td>
                  <td>{row.brc}</td>
                  <td>{row.brn}</td>
                  <td>{row.community}</td>
                  <td>{row.min_cutoff || '-'}</td>
                  <td>{row.max_rank || '-'}</td>
                  <td>{row.year}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
           {/* Pagination Controls */}
          <div className="pagination">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
              Previous
            </button>
            <span> Page {page} of {totalPages} </span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadJson;
