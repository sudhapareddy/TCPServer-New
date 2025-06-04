const mongoose = require("mongoose");

const snfBufSchema = new mongoose.Schema({}, { strict: false });

module.exports = (collectionName) => {
  return (
    mongoose.models[collectionName] ||
    mongoose.model(collectionName, snfBufSchema, collectionName)
  );
};
