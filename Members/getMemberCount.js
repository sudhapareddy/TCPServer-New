const getMembers = require("../Members/getMembers");

async function getMemberCount(socket, deviceState) {
  try {
    deviceState.memberData = await getMembers(socket.deviceId);
    if (deviceState.memberData) {
      const { totalCount, records } = deviceState.memberData;

      if (!Array.isArray(records) || records.length === 0) {
        return socket.write(`#SCTMEMBERCOUNT:${socket.deviceId}NO RECORDS!\n`);
      }

      // Respond to IoT device with total count
      const countMsg = `#SCTMEMBERCOUNT:${socket.deviceId}${String(
        totalCount
      ).padStart(4, "0")}!`;

      return socket.write(countMsg);
    }

    return socket.write(`#SCTMEMBERCOUNT:${socket.deviceId}NO RECORDS!\n`);
  } catch (err) {
    console.error("❌ Error fetching member count:", err);
    socket.write(`#SCTMEMBERCOUNT:${socket.deviceId}ERROR!\n`);
  }
}

module.exports = getMemberCount;
