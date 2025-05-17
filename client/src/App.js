import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AddPet from './pages/AddPet';
import EditPet from './pages/EditPet';
import AdminDashboard from './pages/AdminDashboard'; // ✅ make sure this path is correct

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/add-pet" element={<AddPet />} />
        <Route path="/edit-pet/:id" element={<EditPet />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* ✅ FIX */}
      </Routes>
    </Router>
  );
}

export default App;
