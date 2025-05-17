import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match.');
      return;
    }

    const isValidPassword = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
    if (!isValidPassword) {
      setMessage('❌ Password must have at least 8 characters, an uppercase letter, a number, and a special symbol.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/users/register', {
        name, email, password
      });
      setMessage(res.data.message);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Pawfect Match</h1>
      <p style={{ fontStyle: 'italic' }}>Bringing pets and people together.</p>
      <h2>Register</h2>

      <form onSubmit={handleSubmit} style={{ display: 'inline-block', marginTop: '20px' }}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        /><br /><br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        /><br /><br />

        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        /><br /><br />

        <input
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        /><br /><br />

        <label>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={togglePasswordVisibility}
          /> Show Password
        </label><br /><br />

        <button type="submit">Register</button>
      </form>

      {message && <p>{message}</p>}

      <p style={{ marginTop: '15px' }}>
        Already have an account? <Link to="/">Log in here</Link>.
      </p>
    </div>
  );
}

export default Register;
