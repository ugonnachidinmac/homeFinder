const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

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

  // testing API

/*app.get("/textone", (req, res) => {
  res.send("Welcome to home Finder App");
});*/

app.post("/sign-up", async (req, res) => {
    try {
      const { username, password, role } = req.body;
  
      if (!username) return res.status(400).json({ message: "Please add your email" });
      if (!password) return res.status(400).json({ message: "Please enter password" });
      if (password.length < 8) return res.status(400).json({ message: "Password should be a min of 8 chars" });
  
      const existingUser = await User.findOne({ username });
      if (existingUser) return res.status(400).json({ message: "User account already exists" });
  
      const roleLower = role.toLowerCase();
      const allowedRoles = ['agent', 'user'];
  
      if (!allowedRoles.includes(roleLower)) {
        return res.status(400).json({ message: "Role must be 'agent' or 'user'" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 12);
  
      const newUser = new User({ username, password: hashedPassword, role: roleLower });
      await newUser.save();
  
      return res.status(201).json({
        message: "User account created successfully",
        user: {
          id: newUser._id,
          username: newUser.username,
          role: newUser.role
        }
      });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  