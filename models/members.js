const mongoose = require("mongoose");

const membersSchema = new mongoose.Schema({
  CODE: Number,
  MILKTYPE: String,
  COMMISSIONTYPE: String,
  MEMBERNAME: String,
  CONTACTNO: String,
  STATUS: String,
});
module.exports = function getRecordModel(collectionName) {
  return (
    mongoose.models[collectionName] ||
    mongoose.model(collectionName, membersSchema, collectionName)
  );
};
