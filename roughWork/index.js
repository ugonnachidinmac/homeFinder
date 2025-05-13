// const a = " listetting"

// console.log(a)


const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const bcrypt = require("bcryptjs")
// const jwt = require("jsonwebtoken")
const Auth = require("./authModel")
dotenv.config()

const app = express()

app.use(express.json())

const PORT = process.env.PORT || 8000

const MONGODB_URL = "mongodb+srv://ugonnachidinmac:March131990@cluster0.36p84so.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"



mongoose.connect(`${process.env.MONGODB_URL}`)

.then(()=>{
    console.log("MongoDB Connected...")
    app.listen(PORT, ()=>{
        console.log(`Server started running on ${PORT}`)
    })
})

app.get("/textone", (request, response)=>{
    response.send("Welcome to home Finder App")
})

app.post("/sign-up", async (req, res)=>{

    try {
        
        const { email, password, firstName, lastName, state } = req.body

        if(!email){
            return res.status(400).json({message: "Please add your email"})
        }
    
        if(!password){
            return res.status(400).json({message: "Please enter password"})
        }
        // if(password.length<8){
        //     return res.status(400).json({message: "Please password should be min of 8 char"})
        // }
    
        const existingUser = await Auth.findOne({ email })
    
        if(existingUser){
            return res.status(400).json({message: "User account already exist"})
        }
    
        if(password.length < 8){
            return res.status(400).json({message: "Password should be a min of 8 chars"}) 
        }

        const hashedPassword = await bcrypt.hash(password, 12)
    
        const newUser = new Auth({ 
            email, 
            password: hashedPassword, 
            firstName, 
            lastName, 
            state 
        })
    
        await newUser.save()

        // Send user Email
    
        return res.status(200).json({
            message: "User account created successfully",
            newUser: { email, firstName, lastName, state }
        })


    } catch (error) {
        res.status(500).json({message: error.message})
    }

})


//************************** two */

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
 