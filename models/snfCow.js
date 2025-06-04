const mongoose = require("mongoose");

const snfCowSchema = new mongoose.Schema({}, { strict: false }); // Adjust schema if needed

module.exports = (collectionName) => {
  return (
    mongoose.models[collectionName] ||
    mongoose.model(collectionName, snfCowSchema, collectionName)
  );
};
