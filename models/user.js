const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
  files: { type: [{ name: String, created_at: String, size: Number }] },
});

module.exports = mongoose.model("User", schema);
