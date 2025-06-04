const DeviceModel = require("../models/device");

async function getRatechartIDs(socket) {
  try {
    const ratechart = await DeviceModel.findOne(
      { deviceid: socket.deviceId },
      { rateChartIds: 1, effectiveDates: 1, _id: 0 }
    );

    return ratechart;
  } catch (err) {
    console.error(`Error fetching data from device:`, err);
    return "ERROR";
  }
}

async function handleRateChartIds(socket, deviceState) {
  try {
    // Fetch rate chart IDs and effective dates
    const { rateChartIds, effectiveDates } = await getRatechartIDs(socket);

    // Check if rate chart IDs were fetched successfully
    if (!rateChartIds || rateChartIds === "ERROR") {
      return socket.write(
        `#SCTRATECHARTIDS:${socket.deviceId}No records found!\n`
      );
    }

    // Update device state with rate chart and effective dates
    Object.assign(deviceState, rateChartIds);
    Object.assign(deviceState, effectiveDates);

    // Construct response message with rate chart IDs
    const responseData = `#SCTRATECHARTIDS:${socket.deviceId}${rateChartIds.fatCowId}${rateChartIds.fatBufId}${rateChartIds.snfCowId}${rateChartIds.snfBufId}!`;

    return socket.write(responseData);
  } catch (error) {
    console.error("❌ Error fetching rate chart IDs:", error);
    socket.write(`#SCTRATECHARTIDS:${socket.deviceId}ERROR!\n`);
  }
}

// Export both functions properly
module.exports = handleRateChartIds;
