const mongoose = require("mongoose");
const AdoptionRequest = require("./AdoptionRequest");

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  petId: {
    type: String,
    unique: true, // ❗️no longer required
    default: function () {
      return "PET-" + Date.now().toString(36).toUpperCase();
    }
  },
  adopted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// ✅ Cascade delete related adoption requests
petSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    try {
      await AdoptionRequest.deleteMany({ pet: doc._id });
    } catch (err) {
      console.error("Error deleting adoption requests:", err);
    }
  }
});

module.exports = mongoose.model("Pet", petSchema);
