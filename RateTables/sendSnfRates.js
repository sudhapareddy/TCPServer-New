function sendSnfRate(command, message, socket, deviceState) {
  const snfType = command.includes("BUF") ? "snfBufRecord" : "snfCowRecord";

  const fatMatch = message.match(
    new RegExp(`${socket.deviceId}(0*\\d+\\.\\d+)!`)
  );

  if (!fatMatch) {
    socket.write("#Invalid FAT format!\n");
    return;
  }

  const fatValue = parseFloat(fatMatch[1]).toFixed(1);
  const rate = deviceState.fatsnfRateMapping[fatValue];

  if (!rate) {
    socket.write("#Rate value not found!\n");
    return;
  }

  const response = `#${command.slice(1)}:${socket.deviceId}${
    deviceState[snfType]
  }${rate}!\n`;

  socket.write(response);

  // Move to next FAT value for SNF mapping
  deviceState[snfType] = (parseFloat(deviceState[snfType]) + 0.1)
    .toFixed(1)
    .padStart(4, "0");
}

module.exports = sendSnfRate;
