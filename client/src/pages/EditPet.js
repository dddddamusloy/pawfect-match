import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function EditPet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    breed: '',
    age: '',
    description: '',
    image: '',
    petId: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // ✅ Fetch pet data
  useEffect(() => {
    axios.get(`https://pawfect-backend.onrender.com/api/pets/${id}`)
      .then(res => setForm(res.data))
      .catch(err => {
        console.error(err);
        setError('❌ Failed to load pet data.');
      });
  }, [id]);

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
    formData.append('age', form.age);
    formData.append('description', form.description);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await axios.put(`https://pawfect-backend.onrender.com/api/pets/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setMessage('✅ Pet updated successfully.');
      setTimeout(() => navigate('/admin'), 1500); // Back to AdminDashboard
    } catch (err) {
      console.error('Update failed:', err.response || err);
      setError('❌ Failed to update pet.');
    }
  };

  return (
    <div style={styles.container}>
      <h1>Edit Pet</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name || ''}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="breed"
          placeholder="Breed"
          value={form.breed || ''}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="age"
          placeholder="Age (e.g. 2 years)"
          value={form.age || ''}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description || ''}
          onChange={handleChange}
          required
          style={styles.input}
        />
        {/* 🔒 Display Pet ID (non-editable) */}
        <input
          type="text"
          name="petId"
          value={form.petId || 'N/A'}
          disabled
          style={{ ...styles.input, backgroundColor: '#f0f0f0', color: '#666' }}
          title="Pet ID is auto-generated and cannot be edited."
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleFileChange}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Update Pet</button>
      </form>

      {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '500px',
    margin: '2rem auto',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.6rem 1.2rem',
    fontSize: '1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

export default EditPet;
