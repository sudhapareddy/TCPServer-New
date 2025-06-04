const getMinMaxFatSnf = require("./GetSnfMinMax"); // adjust path as needed

async function sendSnfLimits(command, message, socket, deviceState) {
  const isBuf = command.includes("BUF");
  const rateTableType = isBuf ? "SNFBUF" : "SNFCOW";
  const rateTableId = isBuf ? deviceState.snfBufId : deviceState.snfCowId;
  const effectiveDate = isBuf
    ? deviceState.snfBufEffectiveDate
    : deviceState.snfCowEffectiveDate;

  if (message === `${command}:${socket.deviceId}${rateTableId}!`) {
    return socket.write("#NO NEW RATE CHART AVAILABLE!");
  }

  const limits = await getMinMaxFatSnf(rateTableType, socket);
  deviceState.fatsnfRateMapping = limits.fatRateMapping;

  //const snfId = rateTableId;
  const snfKey = isBuf ? "snfBufRecord" : "snfCowRecord";
  deviceState[snfKey] = limits.minFat;

  const response = `#${command.slice(1)}:${socket.deviceId}${rateTableId}${
    limits.minFat
  }${limits.maxFat}${limits.minSnf}${limits.maxSnf}${effectiveDate}!`;
  socket.write(response);
}

module.exports = sendSnfLimits;
