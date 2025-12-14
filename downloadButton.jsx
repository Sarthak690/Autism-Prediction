import React from "react";
import axios from "axios";
import './downloadButton.css';

const apiUrl = process.env.REACT_APP_API_URL;

function DownloadButton({ mode, community, value, certainty, courseId, courseName, courseGroup, year }) {
  const handleDownload = async () => {
    try {
      const params = {
        mode,
        community,
        value,
        certainty,
        courseId,
        courseName,
        courseGroup,
        year,
      };

      const res = await axios.get(`${apiUrl}/api/user/download/xlsx`, {
        params,
        responseType: "blob",
      });

      // Create a blob link for download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `TNEA_results_${community}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Failed to download results. Please try again.");
    }
  };

  return (
    <button className="download-btn" onClick={handleDownload}>
      ⬇ Download Results (XLSX)
    </button>
  );
}

export default DownloadButton;
