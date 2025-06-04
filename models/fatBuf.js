const mongoose = require("mongoose");

const fatBufSchema = new mongoose.Schema({
  FAT: Number,
  RATE: Number,
  // Add other fields as needed
});

module.exports = function (collectionName) {
  return (
    mongoose.models[collectionName] ||
    mongoose.model(collectionName, fatBufSchema, collectionName)
  );
};
