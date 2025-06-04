const mongoose = require("mongoose");

async function deleteAllMemberRecords(socket) {
  const collectionName = `${socket.deviceId}_membersList`;

  try {
    // Drop the collection
    await mongoose.connection.dropCollection(collectionName);

    console.log("✅ Member records deleted successfully.");
    socket.write(`#SCTDELETEALL:${socket.deviceId}!`);
  } catch (err) {
    // Handle error if collection doesn't exist or fails to delete
    console.error("❌ Error deleting collection:", err.message);
    socket.write("#Error deleting collection!\n");
  }
}

module.exports = deleteAllMemberRecords;
