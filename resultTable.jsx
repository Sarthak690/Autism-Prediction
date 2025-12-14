import React, { useState, useEffect } from 'react';

import './resultTable.css';

function ResultsTable({ results, community,courseMap}) {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [sortedResults, setSortedResults] = useState([]);

  useEffect(() => {
    // Sort based on mode
    if (!results.length) return;

    const type = results[0]?.type;
    const sorted = [...results].sort((a, b) => {
      const aVal = a[community] || Infinity;
      const bVal = b[community] || Infinity;

      if (type === 'Rank') return aVal - bVal;      // Ascending rank
      else return bVal - aVal;                      // Descending cutoff
    });

    setSortedResults(sorted);
    setPage(1);
  }, [results, community]);

  const paginated = sortedResults.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(sortedResults.length / perPage);

  if (results.length === 0) return <p>No matching colleges found.</p>;

  return (
    <div className="table-container">
      <table className="results-table">
        <thead>
          <tr>
            <th>Counselling Code</th>
            <th>College</th>
            <th>Course</th>
            <th>Course ID</th>
            <th>{community}</th>
            <th>Year</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((row, idx) => (
            <tr key={idx}>
              <td>{row.coc}</td>
              <td>{row.con}</td>
              <td>{row.brn}</td>
              <td>{courseMap[row.brc]||row.brc}</td>
              <td>{row.value ?? "N/A"}</td> 
              <td>{row.year}</td>
              <td>{row.type}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
}

export default ResultsTable;