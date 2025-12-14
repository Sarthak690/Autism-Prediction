import React from "react";
import { communityList, courseGroups } from "../utils/helpers";
import "./search.css";

function Search({
  mode, setMode,
  value, setValue,
  community, setCommunity,
  certainty, setCertainty,
  courseId, setCourseId,
  courseMap,
  courseName, setCourseName,
  courseGroup, setCourseGroup,
  fetchData
}) {
  return (
    <div className="search-container">
      <h2>Search Colleges</h2>

      <div className="search-field">
        <label>Mode</label>
        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option value="cutoff">Search by Cutoff</option>
          <option value="rank">Search by Rank</option>
        </select>
      </div>

      <div className="search-field">
        <label>Value ({mode === "rank" ? "General Rank" : "Cutoff"})</label>
        <input
          type="number"
          value={value}
          onChange={e => setValue(Number(e.target.value))}
        />
      </div>

      <div className="search-field">
        <label>Community</label>
        <select value={community} onChange={e => setCommunity(e.target.value)}>
          {communityList.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="search-field">
        <label>Certainty</label>
        <select value={certainty} onChange={e => setCertainty(e.target.value)}>
          <option value="confirm">Confirm</option>
          <option value="maybe">Maybe</option>
        </select>
      </div>

      <div className="search-field">
        <label>Course ID</label>
        <select value={courseId} onChange={e => setCourseId(e.target.value)}>
          <option value="">Any</option>
          {Object.keys(courseMap).sort().map(courseId => (
            <option key={courseId} value={courseId}>{courseId}</option>
          ))}
        </select>
      </div>

      <div className="search-field">
        <label>Course Name</label>
        <select value={courseName} onChange={e => setCourseName(e.target.value)}>
          <option value="">Any</option>
          {Object.entries(courseMap)
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([courseId, name]) => (
              <option key={courseId} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="search-field">
        <label>Course Group</label>
        <select value={courseGroup} onChange={e => setCourseGroup(e.target.value)}>
          {Object.keys(courseGroups).map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>
  
      <button className="search-button" onClick={fetchData}>
       Search
      </button>
     
    </div>
  );
}

export default Search;
