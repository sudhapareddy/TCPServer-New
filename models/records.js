// const { mongoose } = require("../db");

// const recordSchema = new mongoose.Schema({
//   CODE: Number,
//   MILKTYPE: String,
//   FAT: Number,
//   SNF: Number,
//   QTY: Number,
//   RATE: Number,
//   SAMPLEDATE: String,
//   SAMPLETIME: String,
//   SHIFT: String,
//   ANALYZERMODE: String,
//   WEIGHTMODE: String,
//   CLR: Number,
//   WATER: Number,
//   ANALYZERSAMPLETIME: String,
//   INCENTIVEAMOUNT: Number,
//   RECORDTYPE: String,
// });

// const Record = mongoose.model("Record", recordSchema);
// module.exports = Record;

const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  DEVICEID: String,
  CODE: Number,
  MILKTYPE: String,
  FAT: Number,
  SNF: Number,
  QTY: Number,
  RATE: Number,
  SAMPLEDATE: String,
  SAMPLETIME: String,
  SHIFT: String,
  ANALYZERMODE: String,
  WEIGHTMODE: String,
  CLR: Number,
  WATER: Number,
  ANALYZERSAMPLETIME: String,
  INCENTIVEAMOUNT: Number,
  RECORDTYPE: String,
});

// Export a function to get the model with a dynamic collection name
module.exports = function getRecordModel(collectionName) {
  return (
    mongoose.models[collectionName] ||
    mongoose.model(collectionName, recordSchema, collectionName)
  );
};
