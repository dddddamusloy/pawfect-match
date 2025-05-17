import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // Login
      const res = await axios.post('http://localhost:5000/api/users/login', formData, {
        withCredentials: true,
      });
      setMessage(res.data.message);

      // ✅ Fetch user role
      const userRes = await axios.get('http://localhost:5000/api/users/me', {
        withCredentials: true,
      });

      // ✅ Redirect based on role
      if (userRes.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }

    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>🐾 Pawfect Match</h1>
      <p style={{ fontStyle: 'italic' }}>
        "Bringing pets and people together."
      </p>
      <h2>Login</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <label style={styles.label}>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={togglePasswordVisibility}
          /> Show Password
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '1rem' }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>

      {message && <p>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '2rem auto',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    fontSize: '0.9rem',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
};

export default Login;
