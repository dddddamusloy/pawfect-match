const express = require("express");
const multer = require("multer");
const path = require("path");
const Pet = require("../models/Pet");
const { verifyToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

// ✅ Configure Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Serve uploaded images statically
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// GET all pets (admin only)
router.get("/all", verifyToken, isAdmin, async (req, res) => {
  try {
    const pets = await Pet.find(); // ✅ includes adopted
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET only available pets
router.get("/", async (req, res) => {
  try {
    const pets = await Pet.find({ adopted: false }); // ✅ only non-adopted
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET pet by ID
router.get("/:id", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST create new pet (admin only)
router.post("/", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, breed, age, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const newPet = new Pet({
      name,
      breed,
      age,
      description,
      image // petId and adopted are handled by the schema
    });

    await newPet.save();
    res.status(201).json(newPet);
  } catch (err) {
    console.error("❌ Failed to add pet:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ PUT update pet (admin only)
router.put("/:id", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { name, breed, age, description } = req.body;
    const updatedFields = { name, breed, age, description };

    if (req.file) {
      updatedFields.image = `/uploads/${req.file.filename}`;
    }

    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, updatedFields, { new: true });

    if (!updatedPet) return res.status(404).json({ message: "Pet not found" });

    res.json(updatedPet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE pet and related adoption requests (admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedPet = await Pet.findOneAndDelete({ _id: req.params.id }); // triggers post hook
    if (!deletedPet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.json({ message: "Pet and related adoption requests deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
