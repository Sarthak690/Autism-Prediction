import React,{useState,useEffect} from "react";
import axios from "axios";
import Search from "../components/search";
import ResultsTable from "../components/resultTable";
import DownloadButton from "../components/downloadButton";

const apiUrl = process.env.REACT_APP_API_URL;

function User() {
  const [mode, setMode] = useState('rank');
  const [community, setCommunity] = useState('OC');
  const [value, setValue] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseGroup, setCourseGroup] = useState('ANY');
  const [certainty, setCertainty] = useState('confirm');
  const [courseMap, setCourseMap]=useState({});
  const [results, setResults] = useState([]);

   useEffect(() => {
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/user/courses`);
      const map = {};
      res.data.forEach(cr => { map[cr.id] = cr.name });
      setCourseMap(map);
    } catch (err) {
      console.error("Error fetching courses", err);
    }
  };

  fetchCourses();
   }, []);

   const fetchData = async () => {
    try {
      console.log("Fetch data called with:",{mode,community,value,certainty,courseId,courseName,courseGroup});
      
      // Send the raw value - let backend handle the processing
      const res = await axios.get(`${apiUrl}/api/user/search`, {
        params: {
          mode,
          community,
          value, 
          certainty,
          courseId,
          courseName,
          courseGroup,
        }
      });
      
      console.log("API response:",res.data);
      setResults(res.data);
    } catch (err) {
      console.error("Error fetching results", err);
    }
  };
  
   

  return (
    <div className="userland">
      <Search
        mode={mode} setMode={setMode}
        value={value} setValue={setValue}
        community={community} setCommunity={setCommunity}
        courseId={courseId} setCourseId={setCourseId}
        courseName={courseName} setCourseName={setCourseName}
        courseGroup={courseGroup} setCourseGroup={setCourseGroup}
        certainty={certainty} setCertainty={setCertainty}
        courseMap={courseMap}
        fetchData={fetchData}
      />
        
        <ResultsTable 
          results={results} 
          community={community} 
          courseMap={courseMap}
        />
         {results.length > 0 && (
        <DownloadButton
          mode={mode}
          community={community}
          value={value}
          certainty={certainty}
          courseId={courseId}
          courseName={courseName}
          courseGroup={courseGroup}
        />
      )} 
    </div>
  );
};

export default User;