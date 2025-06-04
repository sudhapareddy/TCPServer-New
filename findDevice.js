const DeviceModel = require("./models/device");

async function getRegisteredDevice(deviceId) {
  console.log("dfdfdf", deviceId);
  try {
    const device = await DeviceModel.findOne(
      { deviceid: deviceId },
      { deviceid: 1, status: 1, _id: 0 }
    );
    console.log("device details:", device);

    return device; // Returns full document or null
  } catch (error) {
    console.error("Error finding device:", error);
    return null;
  }
}

module.exports = getRegisteredDevice;
