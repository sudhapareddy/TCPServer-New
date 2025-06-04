const getMemberModel = require("../models/members");

async function updateMemberRecord(deviceId, codeToMatch, newRecord) {
  codeToMatch = codeToMatch.toString().replace(/^0+/, "");

  const MemberRecord = getMemberModel(`${deviceId}_membersList`);

  console.log(codeToMatch);
  try {
    console.log(newRecord);
    const updatedRecord = await MemberRecord.findOneAndUpdate(
      { CODE: codeToMatch }, // Find record by `code`
      { $set: newRecord }, // ✅ Update only received fields
      { new: true } // Return updated record
    );

    if (updatedRecord) {
      console.log("Replaced Record:", updatedRecord);
      return updatedRecord;
    } else {
      console.log("No record found with the given code.");
      return null;
    }
  } catch (err) {
    console.error("Error replacing record:", err);
    return null;
  }
}

async function editMemberRecord(message, socket) {
  const index = message.indexOf(`${socket.deviceId}`);

  if (index !== -1) {
    const code = message.substring(index + 7, index + 11);
    const milkType = message[index + 11];
    const commType = message[index + 12];
    const memberName = message
      .substring(index + 13, index + 33)
      .padEnd(20, " ");
    const contactNo = message.substring(index + 33, index + 43).padEnd(10, " ");
    const status = message[index + 43];

    const updatedRecord = {
      CODE: code,
      MILKTYPE: milkType,
      COMMISSIONTYPE: commType,
      MEMBERNAME: memberName,
      CONTACTNO: contactNo,
      STATUS: status,
    };

    const updated = await updateMemberRecord(
      socket.deviceId,
      code,
      updatedRecord
    );

    if (updated) {
      console.log("✅ Record updated successfully\n");
      socket.write(`#SCTEDITMEMBER:${socket.deviceId}${code}!`);
    } else {
      console.log("❌ No record found to update!\n");
      socket.write("#No record found to update!");
    }
  } else {
    console.log("⚠️ Device ID not found in message.\n");
  }
}

module.exports = editMemberRecord;
