const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const Property = require("./modelFolder/propertyModel")
const User = require("./modelFolder/userModel");

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDB Connected...");
    app.listen(PORT, () => {
      console.log(`Server started running on ${PORT}`);
    });
  })
  .catch(err => console.error("MongoDB connection failed:", err));

//  Milestone 1.1: Setup user roles (agent and regular user)
app.post("/sign-up", async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
  
      // Validate required fields
      if (!username) return res.status(400).json({ message: "Please add your username" });
      if (!email) return res.status(400).json({ message: "Please add your email" });
      if (!password) return res.status(400).json({ message: "Please enter password" });
      if (password.length < 8) return res.status(400).json({ message: "Password should be a min of 8 chars" });
  
      // Check if email or username already exists
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) return res.status(400).json({ message: "Email already in use" });
  
      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) return res.status(400).json({ message: "Username already in use" });
  
      // Validate role
      const roleLower = role.toLowerCase();
      const allowedRoles = ['agent', 'user'];
  
      if (!allowedRoles.includes(roleLower)) {
        return res.status(400).json({ message: "Role must be 'agent' or 'user'" });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
  
      // Create new user
      const newUser = new User({ username, email, password: hashedPassword, role: roleLower });
      await newUser.save();
  
      return res.status(201).json({
        message: "User account created successfully",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  


//  Milestone 1.2: Agents can add new property listings
app.post("/properties", async (req, res) => {
  try {
    const { title, price, location, agentId } = req.body;

    // Check required fields
    if (!title || !price || !location || !agentId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if agent exists and has role 'agent'
    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (agent.role !== "agent") {
      return res.status(403).json({ message: "Only agents can post properties" });
    }

    // Create property
    const newProperty = new Property({
      title,
      price,
      location,
      agent: agentId,
    });

    await newProperty.save();

    return res.status(201).json({
      message: "Property created successfully",
      property: newProperty,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
