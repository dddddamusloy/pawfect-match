// Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [pets, setPets] = useState([]);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPets();
    fetchUserRequests();
  }, []);

  const fetchPets = async () => {
    try {
      const res = await axios.get('https://pawfect-backend.onrender.com/api/pets');
      setPets(res.data);
    } catch (err) {
      console.error('Failed to load pets:', err);
    }
  };

  const fetchUserRequests = async () => {
    try {
      const res = await axios.get('https://pawfect-backend.onrender.com/api/adoptions/my-requests', {
        withCredentials: true
      });
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load adoption requests:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('https://pawfect-backend.onrender.com/api/users/logout', {}, {
        withCredentials: true
      });
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleAdoptRequest = async (petId) => {
    const message = window.prompt("Enter a short message for your request (optional):") || "";

    try {
      await axios.post('https://pawfect-backend.onrender.com/api/adoptions/request', {
        petId,
        message
      }, { withCredentials: true });

      fetchUserRequests();
    } catch (err) {
      alert(err.response?.data?.message || '❌ Failed to submit request.');
    }
  };

  const handleCancelRequest = async (requestId) => {
    const confirm = window.confirm("Cancel this adoption request?");
    if (!confirm) return;

    try {
      await axios.delete(`https://pawfect-backend.onrender.com/api/adoptions/${requestId}`, {
        withCredentials: true
      });
      fetchUserRequests();
    } catch (err) {
      alert('❌ Failed to cancel request.');
    }
  };

  const getRequestForPet = (petId) => {
    return requests.find(r => r.pet._id === petId);
  };

  return (
    <div style={styles.container}>
      <div style={styles.topRight}>
        <button onClick={handleLogout} style={styles.button}>Logout</button>
      </div>

      <div style={styles.header}>
        <h1>🐾 Pawfect Match</h1>
        <p style={styles.tagline}>Bringing pets and people together.</p>
      </div>

      <h2 style={styles.subheading}>Available Pets</h2>
      <div style={styles.grid}>
        {pets.map(pet => {
          const userRequest = getRequestForPet(pet._id);
          return (
            <div key={pet._id} style={styles.card}>
              <img
                src={pet.image ? `https://pawfect-backend.onrender.com${pet.image}` : "https://via.placeholder.com/250"}
                alt={pet.name}
                style={styles.image}
              />
              <h3>{pet.name?.toUpperCase()}</h3>
              <p><strong>ID:</strong> {pet.petId || 'N/A'}</p>
              <p>{pet.breed?.toUpperCase()}</p>
              <p>{pet.age?.toUpperCase()} OLD</p>
              <p>{pet.description?.toUpperCase()}</p>

              {userRequest ? (
                <div>
                  <p style={{
                    color: userRequest.status === 'approved' ? 'green'
                      : userRequest.status === 'rejected' ? 'red'
                        : '#555'
                  }}>
                    {userRequest.status === 'pending' && '✅ Request Sent (Pending)'}
                    {userRequest.status === 'approved' && '🎉 Request Approved'}
                    {userRequest.status === 'rejected' && '❌ Request Rejected'}
                  </p>
                  {userRequest.status === 'pending' && (
                    <button
                      onClick={() => handleCancelRequest(userRequest._id)}
                      style={{ ...styles.adoptButton, backgroundColor: '#ffc107' }}
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleAdoptRequest(pet._id)}
                  style={styles.adoptButton}
                >
                  Request to Adopt
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 💙 My Adoption Requests */}
      {requests.length > 0 && (
        <div style={styles.requestWrapper}>
          <h2 style={{ textAlign: 'center' }}>My Adoption Requests</h2>
          <div style={styles.requestGrid}>
            {requests.map(req => (
              <div key={req._id} style={styles.requestCard}>
                <h4>{req.pet?.name?.toUpperCase() || 'UNKNOWN'}</h4>
                <p><strong>Pet ID:</strong> {req.pet?.petId || 'N/A'}</p>
                <p><strong>Breed:</strong> {req.pet?.breed?.toUpperCase() || 'N/A'}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span style={{
                    color: req.status === 'approved' ? 'green'
                      : req.status === 'rejected' ? 'red'
                        : '#333'
                  }}>
                    {req.status}
                  </span>
                </p>
                {req.status === 'pending' && (
                  <button onClick={() => handleCancelRequest(req._id)} style={styles.cancelBtn}>Cancel Request</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
  },
  topRight: {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    zIndex: 10,
  },
  button: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  header: {
    textAlign: 'center',
    marginTop: '2rem',
    marginBottom: '2rem',
  },
  tagline: {
    fontStyle: 'italic',
    fontSize: '0.9rem',
  },
  subheading: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    justifyContent: 'center',
    alignItems: 'start',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  card: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    aspectRatio: '4 / 3',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  adoptButton: {
    marginTop: '0.75rem',
    padding: '6px 12px',
    fontSize: '0.8rem',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  requestWrapper: {
    border: '2px solid #ccc',
    padding: '1.5rem',
    borderRadius: '10px',
    backgroundColor: '#f0f8ff',
    marginTop: '3rem',
    maxWidth: '1000px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  requestGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  requestCard: {
    backgroundColor: '#fff',
    border: '1px solid #bbb',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'left',
    fontSize: '0.85rem',
  },
  cancelBtn: {
    marginTop: '0.75rem',
    padding: '6px 10px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  }
};

export default Home;
