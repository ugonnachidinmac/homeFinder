
const express = require("express");
const {
  handleUserRegistration,
  handleLogin,
  handleCreateProperties,
  handleForgotPassword,
  handleGetAllUsers,
  handleFilteredProperties,
} = require("../Controllers");

const { validateRegister, authorization } = require("../middleware");
const { authorizeUser } = require('../middleware/authMiddleware');
const { saveProperty, unsaveProperty } = require('../Controllers/savedPropertyController');
const { getSavedProperties } = require('../Controllers/savedPropertyController');
const { getAllProperties, getPropertyById } = require('../Controllers/propertyController');
const { handleResetPassword } = require('../Controllers');


const router = express.Router();

// User auth routes
router.post("/sign-up", validateRegister, handleUserRegistration);
router.post("/login", handleLogin);

// Password
router.post("/forgot-password", handleForgotPassword);
router.patch("/reset-password", authorization, handleResetPassword);

// Users
router.get("/all-users", authorization, handleGetAllUsers);

// Property
// Milestone 3: Enforce permissions: only agents can create.
router.post("/properties", handleCreateProperties);
router.get("/properties", authorizeUser, getAllProperties);
//Milestone 3: GET saved listings for a user. 
router.get('/users/:userId/saved-properties', authorizeUser, getSavedProperties);
// Milestone 3 Adding property filtering
router.get('/properties/filter', authorizeUser, handleFilteredProperties);
router.get("/properties/:id", authorizeUser, getPropertyById);


// Save/Unsave
router.post("/users/:userId/properties/:propertyId/save", authorizeUser, saveProperty);
router.delete("/users/:userId/properties/:propertyId/unsave", authorizeUser, unsaveProperty);


module.exports = router;
