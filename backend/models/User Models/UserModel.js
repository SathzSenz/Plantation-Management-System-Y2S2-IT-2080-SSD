// UserModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  passwordHash: String,        
  roles: { type: [String], enum:['user','manager','admin'], default: ['user'] }, 
  oidc_sub: String,           
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model("User", userSchema);
