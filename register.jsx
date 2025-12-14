import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './register.css';
import { EyeIcon,EyeOffIcon } from 'lucide-react';
const apiUrl=process.env.REACT_APP_API_URL;

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    cutoff: '',
    rank: ''
  });

  const validatePassword = (password) => {
    const minLength = /.{8,}/;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /[0-9]/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

    return (
      minLength.test(password) &&
      uppercase.test(password) &&
      lowercase.test(password) &&
      number.test(password) &&
      specialChar.test(password)
    );
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(formData.password)) {
      alert("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/api/user/register`, {
        email: formData.username,
        password: formData.password,
        cutoff: parseFloat(formData.cutoff),
        rank: parseInt(formData.rank)
      });

      alert(response.data.message);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed.");
      console.log(error);
    }
  };

  return (
    <div className='register-container'>
      <h2>User Registration</h2>
      <form className='register-form' onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="email"
            name="username"
            placeholder="Example@gmail.com"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>
        <label className='password-label'>
          <div className='password-wrapper'>
            Password:
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span onClick={togglePasswordVisibility} className="eye-icon">
              {showPassword ? <EyeIcon size={20}/>:<EyeOffIcon size={20}/>}
            </span>
          </div>
        </label>
        <label className='password-label'>
          <div className='password-wrapper'>
            Confirm Password:
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <span onClick={togglePasswordVisibility} className="eye-icon">
              {showPassword ? <EyeIcon size={20}/>:<EyeOffIcon size={20}/>}
            </span>
          </div>
        </label>
        <label>
          Cutoff:
          <input
            type="number"
            step="0.01"
            name="cutoff"
            value={formData.cutoff}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Rank:
          <input
            type="number"
            name="rank"
            value={formData.rank}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit">Register</button>
      </form>

      <p className="switch-text">
        Already have an account?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => navigate('/')}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default Register;
