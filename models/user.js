import mongoose from "mongoose";

const schema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
  files: { type: [{ name: String, created_at: String, size: Number }] },
});

const User = mongoose.model("User", schema);

export { User };
