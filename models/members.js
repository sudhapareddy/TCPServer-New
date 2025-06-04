const mongoose = require("mongoose");

//code, milkType, commType, memberName, contactNo, status

// const recordSchema = new mongoose.Schema({
//   CODE: Number,
//   MILKTYPE: String,
//   COMMISSIONTYPE: String,
//   MEMBERNAME: String,
//   CONTACTNO: String,
//   STATUS: String,
// });

// const memberRecord = mongoose.model("MemberRecord", recordSchema);
// module.exports = memberRecord;

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
