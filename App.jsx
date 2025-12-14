import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/login';
import Admin from './pages/admin';
import User from './pages/user';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path ="/user" element={<User/>} />
      </Routes>
    </Router>
  );
}

export default App;

