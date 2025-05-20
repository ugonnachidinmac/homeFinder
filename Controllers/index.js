const User = require("../modelFolder/userModel")
const { validEmail } = require("../sendMail")
const { findUserService } = require("../service")
const bcrypt = require("bcryptjs")


const handleGetAllUsers = async (req, res)=>{

    console.log(req.user)

    const allUser = await findUserService()

    // res.status(200).json({
    //     messga: "Successful",
    //     allUser
    // })

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


module.exports = {
    handleGetAllUsers,
    handleUserRegistration
}