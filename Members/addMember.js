const getMemberModel = require("../models/members");

async function addMember(message, socket) {
  const index = message.indexOf(`${socket.deviceId}`);

  if (index !== -1 && message.length >= index + 44) {
    // Extract fields

    const code = message.substring(index + 7, index + 11);
    const milkType = message[index + 11];
    const commType = message[index + 12];
    const memberName = message.substring(index + 13, index + 33).trim();
    const contactNo = message.substring(index + 33, index + 43).trim();
    const status = message[index + 43];

    // Create dynamic collection name
    const collectionName = `${socket.deviceId}_membersList`;
    const MemberData = getMemberModel(collectionName);

    const newMemberRecord = new MemberData({
      CODE: code,
      MILKTYPE: milkType,
      COMMISSIONTYPE: commType,
      MEMBERNAME: memberName,
      CONTACTNO: contactNo,
      STATUS: status,
    });

    try {
      await newMemberRecord.save();
      socket.write(`#SCTADDMEMBER:${socket.deviceId}${code}!`);
      console.log("Member Added Successfully\n");
    } catch (error) {
      socket.write("#Error Saving Record!\n");
      console.error(error);
    }
  } else {
    socket.write("#Invalid Message Format or Length!\n");
  }
}

module.exports = addMember;
