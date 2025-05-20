const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const Property = require("./modelFolder/propertyModel")
const User = require("./modelFolder/userModel");
const { sendForgotPasswordEmail, validEmail } = require("./sendMail");
const { handleGetAllUsers, handleUserRegistration } = require("./Controllers");
const { validateRegister, authorization } = require("./middleware");
const { saveProperty, unsaveProperty } = require('./Controllers/savedPropertyController');
const { authorizeUser } = require('./middleware/authMiddleware');
const { getAllProperties, getPropertyById } = require('./Controllers/propertyController');




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
app.post("/sign-up", validateRegister, handleUserRegistration);
  

//Confirm the signup with Login for testing

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  // Use bcrypt to compare the plain password with hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN,
    { expiresIn: '1h' }
  );

  res.json({ token });
});  



//  Milestone 1.2: Agents can add new property listings
app.post("/properties", async (req, res) => {
    try {
      const { title, price, location, agentId, listingType, image, description } = req.body;
  
      // Check required fields
      if (!title || !price || !location || !agentId || !listingType) {
        return res.status(400).json({ message: "All fields are required including listingType" });
      }
  
      // Validate listingType
      const validTypes = ['sale', 'lease', 'rent'];
      if (!validTypes.includes(listingType.toLowerCase())) {
        return res.status(400).json({ message: "listing Type must be either 'sale','lease' or 'rent'" });
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
        listingType: listingType.toLowerCase(),
        image,        
        description,  
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
  


//************ * today/

app.post("/forgot-password", async (req, res) => {
  const { email, userName } = req.body;

  // let user

  // if(email){
  //     const user = await Auth.findOne({ email })
  // }
  // if(userName){
  //     const user = await Auth.findOne({ userName })
  // }

  const user = await User.findOne({ email });


  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  //   Send the user an email with their token

  const accessToken = await jwt.sign(
    {user},
    `${process.env.ACCESS_TOKEN}`,
    { expiresIn: "5m"}

  )

  await sendForgotPasswordEmail(email, accessToken)

  // Send OTP

  res.status(200).json({ message: "Please check your email inbox" });
});

app.patch("/reset-password",  authorization, async (req, res )=>{

    const { password } = req.body

    const user = await User.findOne({ email: req.user.email })

    if(!user){
        return res.status(404).json({message: "User account not found!"})
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    user.password = hashedPassword

    await user.save()

    res.status(200).json({message: "Password reste successful."})

})

app.get("/all-users", authorization, handleGetAllUsers)

//Milestone 2: Browsing & Saving Properties

// Save a property (protected)
app.post('/users/:userId/properties/:propertyId/save', authorizeUser, saveProperty);

// Unsave a property (protected)
app.delete('/users/:userId/properties/:propertyId/unsave', authorizeUser, unsaveProperty);

// Route to get all properties
app.get('/properties', authorizeUser, getAllProperties);

// Route to get a single property by ID
app.get('/properties/:id', authorizeUser, getPropertyById);

  