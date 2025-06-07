const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const routes = require("./Routes"); 

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

//Build Endpoint Message
app.get("/", (req, res)=>{
  res.status(200).json({message: "Welcome to Homefinder Backend Web App"})
})

// Mount all routes here
app.use("/api", routes);
