import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddPet() {
  const [form, setForm] = useState({
    name: '',
    breed: '',
    ageNumber: '',
    ageUnit: 'years',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('breed', form.breed);
    formData.append('age', `${form.ageNumber} ${form.ageUnit}`);
    formData.append('description', form.description);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await axios.post('http://localhost:5000/api/pets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setMessage('✅ Pet added successfully.');
      setError('');
      setTimeout(() => navigate('/admin'), 1500); // Redirect back to admin dashboard
    } catch (err) {
      console.error('Upload failed:', err.response || err);
      setError(err.response?.data?.message || '❌ Failed to add pet.');
      setMessage('');
    }
  };

  return (
    <div style={styles.container}>
      <h1>Add a New Pet</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required style={styles.input} />
        <input type="text" name="breed" placeholder="Breed" value={form.breed} onChange={handleChange} required style={styles.input} />

        <div style={styles.ageRow}>
          <input
            type="number"
            name="ageNumber"
            placeholder="Age"
            value={form.ageNumber}
            onChange={handleChange}
            required
            style={{ ...styles.input, flex: 2 }}
          />
          <select
            name="ageUnit"
            value={form.ageUnit}
            onChange={handleChange}
            style={{ ...styles.input, flex: 1 }}
          >
            <option value="months">months</option>
            <option value="years">years</option>
          </select>
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input type="file" name="image" accept="image/*" onChange={handleFileChange} style={styles.input} />
        <button type="submit" style={styles.button}>Add Pet</button>
      </form>

      {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}

const styles = {
  container: { maxWidth: '500px', margin: '2rem auto', textAlign: 'center' },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center'
  },
  ageRow: {
    display: 'flex',
    width: '100%',
    gap: '0.5rem'
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '0.6rem 1.2rem',
    fontSize: '1rem',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default AddPet;
