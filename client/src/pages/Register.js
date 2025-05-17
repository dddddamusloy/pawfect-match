import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      return setMessage("Passwords do not match");
    }

    if (!validatePassword(password)) {
      return setMessage("Password must contain uppercase letter, number, special character and be at least 8 characters");
    }

    try {
      const res = await axios.post("https://pawfect-backend.onrender.com/api/users/register", {
        name,
        email,
        password
      });
      setMessage(res.data.message);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Pawfect Match</h1>
      <p style={{ fontStyle: "italic" }}>Bringing pets and people together.</p>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: "inline-block", marginTop: "20px" }}>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required /><br /><br />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required /><br /><br />
        <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" onChange={handleChange} required /><br /><br />
        <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required /><br /><br />
        <label>
          <input type="checkbox" onChange={() => setShowPassword(!showPassword)} />
          Show Password
        </label><br /><br />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
      <p style={{ marginTop: "15px" }}>Already have an account? <Link to="/">Log in here</Link>.</p>
    </div>
  );
}

export default Register;
