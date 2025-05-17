import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function AdminDashboard() {
  const [pets, setPets] = useState({ available: [], adopted: [] });
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/users/me', { withCredentials: true })
      .then(res => {
        if (res.data.role !== 'admin') {
          navigate('/home');
        } else {
          fetchPets();
          fetchRequests();
        }
      })
      .catch(() => navigate('/'));
  }, [navigate]);

  const fetchPets = async () => {
    try {
      const petRes = await axios.get('http://localhost:5000/api/pets/all', {
        withCredentials: true
      });

      const requestRes = await axios.get('http://localhost:5000/api/adoptions/admin', {
        withCredentials: true
      });

      const approvedPetIds = requestRes.data
        .filter(r => r.status === 'approved' && r.pet?._id)
        .map(r => r.pet._id);

      const allPets = petRes.data;
      const adopted = allPets.filter(pet => approvedPetIds.includes(pet._id));
      const available = allPets.filter(pet => !approvedPetIds.includes(pet._id));

      setPets({ available, adopted });
    } catch (err) {
      console.error('Failed to load pets or requests', err);
      setError('Failed to load data.');
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/adoptions/admin', {
        withCredentials: true
      });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Delete this pet?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/pets/${id}`, {
        withCredentials: true
      });
      fetchPets();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const handleStatusChange = async (requestId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/adoptions/${requestId}/status`, { status }, {
        withCredentials: true
      });
      fetchRequests();
      fetchPets();
    } catch (err) {
      alert('Failed to update request');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/users/logout', {}, {
        withCredentials: true
      });
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const renderPetRows = (list) => (
    list.map(pet => (
      <tr key={pet._id}>
        <td>
          <img
            src={pet.image ? `http://localhost:5000${pet.image}` : "https://via.placeholder.com/80"}
            alt={pet.name}
            style={{ width: '80px', borderRadius: '6px' }}
          />
        </td>
        <td>
          <strong>{pet.name?.toUpperCase()}</strong>
          <br />
          <span style={{ fontSize: '0.75rem', color: '#666' }}>{pet.petId || 'N/A'}</span>
        </td>
        <td>{pet.breed?.toUpperCase()}</td>
        <td>{pet.age?.toUpperCase()}</td>
        <td>{pet.description?.toUpperCase()}</td>
        <td>
          <button onClick={() => navigate(`/edit-pet/${pet._id}`)} style={styles.editBtn}>Edit</button>
          <button onClick={() => handleDelete(pet._id)} style={styles.deleteBtn}>Delete</button>
        </td>
      </tr>
    ))
  );

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <h1 style={styles.title}>👑 Admin Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      <ul style={styles.navMenu}>
        <li>📦 Manage Pets</li>
        <li>📋 Manage Requests</li>
        <li><Link to="/add-pet" style={styles.addBtn}>➕ Add Pet</Link></li>
      </ul>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 🐶 Available Pets */}
      <h2>Available Pets</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name & ID</th>
            <th>Breed</th>
            <th>Age</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{renderPetRows(pets.available)}</tbody>
      </table>

      {/* 🐾 Adopted Pets */}
      <h2 style={{ marginTop: '2rem' }}>Adopted Pets</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name & ID</th>
            <th>Breed</th>
            <th>Age</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{renderPetRows(pets.adopted)}</tbody>
      </table>

      {/* 📋 Adoption Requests */}
      <h2 style={{ marginTop: '2.5rem' }}>Adoption Requests</h2>
      {requests.length === 0 ? (
        <p>No adoption requests yet.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Pet</th>
              <th>Pet ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Status</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req._id}>
                <td>{req.pet?.name?.toUpperCase() || 'Unknown'}</td>
                <td>{req.pet?.petId || 'N/A'}</td>
                <td>{req.user?.name}</td>
                <td>{req.user?.email}</td>
                <td style={{ color: req.status === 'approved' ? 'green' : req.status === 'rejected' ? 'red' : '#555' }}>
                  {req.status}
                </td>
                <td>{req.message || '-'}</td>
                <td>
                  {req.status !== 'approved' && (
                    <button onClick={() => handleStatusChange(req._id, 'approved')} style={styles.approveBtn}>
                      Approve
                    </button>
                  )}
                  {req.status !== 'rejected' && (
                    <button onClick={() => handleStatusChange(req._id, 'rejected')} style={styles.rejectBtn}>
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '2rem',
    margin: 0,
    color: '#333'
  },
  logoutBtn: {
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  navMenu: {
    listStyle: 'none',
    paddingLeft: 0,
    marginBottom: '1.5rem',
    fontSize: '1.1rem',
    display: 'flex',
    gap: '2rem'
  },
  addBtn: {
    color: '#fff',
    backgroundColor: '#28a745',
    padding: '6px 12px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
    backgroundColor: '#fff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  editBtn: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '0.4rem 0.8rem',
    marginRight: '5px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  approveBtn: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    padding: '0.3rem 0.7rem',
    borderRadius: '4px',
    marginRight: '0.3rem',
    cursor: 'pointer',
  },
  rejectBtn: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '0.3rem 0.7rem',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

export default AdminDashboard;
