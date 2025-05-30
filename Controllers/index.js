const User = require("../modelFolder/userModel")
const { validEmail } = require("../sendMail")
const { findUserService } = require("../service")
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');

const { sendForgotPasswordEmail } = require('../sendMail');
const Property = require("../modelFolder/propertyModel");




const handleGetAllUsers = async (req, res)=>{

    console.log(req.user)

    const allUser = await findUserService()

    res.status(200).json({
        message: "Successful",
        allUser
    })

}

const handleUserRegistration = async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
  
      // Validate required fields
      if (!username || typeof username !== "string") return res.status(400).json({ 
        message: "Please add your username" });
      if (!email  || typeof email !== "string") return res.status(400).json({
         message: "Please add your email" });
         
      if(!validEmail(email)){
          return  res.status(400).json({message: "Incoprrect email format"})
      }
      if (!password || typeof password !== "string") return res.status(400).json({ 
        message: "Please enter password" });
      if (password.length < 8) return res.status(400).json({ 
        message: "Password should be a min of 8 chars" });
  
      // Check if email or username already exists
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) return res.status(400).json({ 
        message: "Email already in use" });
  
      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) return res.status(400).json({ 
        message: "Username already in use" });
  
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
}


const handleLogin = async (req, res) => {
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
}



// Milestone 3: Enforce permissions: only agents can create.
const handleCreateProperties = async (req, res) => {
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
  }


const handleForgotPassword = async (req, res) => {
  const { email, userName } = req.body;


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
}

//handleResetPassword Starts Here
const handleResetPassword = async (req, res )=>{

    const { password } = req.body

    const user = await User.findOne({ email: req.user.email })

    if(!user){
        return res.status(404).json({message: "User account not found!"})
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    user.password = hashedPassword

    await user.save()

    res.status(200).json({message: "Password reste successful."})

}


// Milestone 3 Adding property filtering
const handleFilteredProperties = async (req, res) => {
  try {
    let { location, minPrice, maxPrice, listingType, agentUsername } = req.query;

    // Sanitize inputs
    if (location) location = location.trim();
    if (listingType) listingType = listingType.trim().toLowerCase();
    if (agentUsername) agentUsername = agentUsername.trim().toLowerCase();

    let match = {};

    if (location) {
      match.location = { $regex: location, $options: "i" }; // case-insensitive
    }

    if (listingType) {
      match.listingType = listingType;
    }

    if (minPrice || maxPrice) {
      match.price = {};
      if (minPrice) match.price.$gte = Number(minPrice);
      if (maxPrice) match.price.$lte = Number(maxPrice);
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "users", // collection name
          localField: "agent",
          foreignField: "_id",
          as: "agentInfo"
        }
      },
      { $unwind: "$agentInfo" }
    ];

    if (agentUsername) {
      pipeline.push({
        $match: { "agentInfo.username": { $regex: agentUsername, $options: "i" } }
      });
    }

    const properties = await Property.aggregate(pipeline);

    res.status(200).json({
      message: "Filtered properties fetched successfully",
      count: properties.length,
      properties
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    handleGetAllUsers,
    handleUserRegistration,
    handleLogin,
    handleCreateProperties,
    handleForgotPassword,
    handleResetPassword,
    handleFilteredProperties
}