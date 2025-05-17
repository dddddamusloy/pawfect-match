const express = require('express');
const router = express.Router();
const AdoptionRequest = require('../models/AdoptionRequest');
const Pet = require('../models/Pet');
const { verifyToken, isAdmin } = require('../middleware/auth');

// ✅ User submits adoption request
router.post('/request', verifyToken, async (req, res) => {
  const { petId, message } = req.body;

  try {
    const exists = await AdoptionRequest.findOne({
      user: req.user.userId,
      pet: petId
    });

    if (exists) {
      return res.status(400).json({ message: 'You already requested to adopt this pet.' });
    }

    const request = new AdoptionRequest({
      user: req.user.userId,
      pet: petId,
      message: message || ''
    });

    await request.save();
    res.status(201).json({ message: 'Adoption request submitted successfully.' });
  } catch (err) {
    console.error('Request error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Admin gets all adoption requests
router.get('/admin', verifyToken, isAdmin, async (req, res) => {
  try {
    const requests = await AdoptionRequest.find()
      .populate('user', 'name email')
      .populate('pet', 'name petId');

    res.json(requests);
  } catch (err) {
    console.error('Admin fetch error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Admin updates request status (approve or reject)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const request = await AdoptionRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('pet');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // ✅ If approved, mark the pet as adopted
    if (status === 'approved' && request.pet?._id) {
      await Pet.findByIdAndUpdate(request.pet._id, { adopted: true });
    }

    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ message: 'Server error during approval.' });
  }
});

// ✅ User fetches their own adoption requests
router.get('/my-requests', verifyToken, async (req, res) => {
  try {
    const requests = await AdoptionRequest.find({ user: req.user.userId })
      .populate('pet', 'name petId breed');
    res.json(requests);
  } catch (err) {
    console.error('User request fetch error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ User cancels their own adoption request
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await request.deleteOne();
    res.json({ message: 'Request cancelled successfully.' });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
