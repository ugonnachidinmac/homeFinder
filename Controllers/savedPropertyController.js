const SavedProperty = require('../modelFolder/savedPropertyModel');
const Property = require('../modelFolder/propertyModel');

const User = require('../modelFolder/userModel');

// Save a property for a user
const saveProperty = async (req, res) => {
  try {
    const { propertyId, userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Check if already saved
    const alreadySaved = await SavedProperty.findOne({ user: userId, property: propertyId });
    if (alreadySaved) return res.status(400).json({ message: "Property already saved" });

    // Save property
    const savedProperty = new SavedProperty({ user: userId, property: propertyId });
    await savedProperty.save();

    res.status(201).json({ message: "Property saved successfully", savedProperty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unsave a property for a user
const unsaveProperty = async (req, res) => {
  try {
    const { propertyId, userId } = req.params;

    // Remove saved property
    const deleted = await SavedProperty.findOneAndDelete({ user: userId, property: propertyId });

    if (!deleted) return res.status(404).json({ message: "Saved property not found" });

    res.status(200).json({ message: "Property unsaved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Milestone 3: GET saved listings for a user.
// Get all saved properties for a user
const getSavedProperties = async (req, res) => {
  try {
    const { userId } = req.params;

    const savedProperties = await SavedProperty.find({ user: userId }).populate('property');

    // Extract the actual property objects
    const properties = savedProperties.map(item => item.property);

    res.status(200).json({
      message: "Saved properties fetched successfully",
      total: properties.length,
      properties
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  saveProperty,
  unsaveProperty,
  getSavedProperties
};
