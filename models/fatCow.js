const mongoose = require("mongoose");

const fatCowSchema = new mongoose.Schema({
  FAT: Number,
  RATE: Number,
  // Add other fields as needed
});

module.exports = function (collectionName) {
  // Check if model already exists
  return (
    mongoose.models[collectionName] ||
    mongoose.model(collectionName, fatCowSchema, collectionName)
  );
};
