function formatMemberRecord(record) {
  const [id, type1, type2, name, blankStr, status] = record;
  const idStr = String(id).padStart(4, "0");
  const nameStr = name.padEnd(20, " ");
  const blank = blankStr.padEnd(10, " ");
  return `${idStr}${type1}${type2}${nameStr}${blank}${status}`;
}

function sendMemberBatch(socket, deviceState, payload) {
  const cleanedPayload = payload.split("!")[0];

  // Extract deviceId (first 7 chars) and batch string (next 4 chars)
  const deviceId = cleanedPayload.substring(0, 7);
  const batchStr = cleanedPayload.substring(7, 11).trim(); // Trim spaces

  const batchNumber = parseInt(batchStr, 10);

  const { totalCount, records } = deviceState.memberData || {};

  if (!Array.isArray(records) || records.length === 0) {
    socket.write(`#SCTMEMBER:${socket.deviceId}NO RECORDS!`);
    return;
  }

  const batchSize = 30;
  const totalBatches = Math.ceil(records.length / batchSize);

  console.log(totalBatches, "batches", batchNumber);

  // If batch number exceeds available batches
  if (batchNumber > totalBatches) {
    socket.write(`#SCTMEMBER:${socket.deviceId}ENDMEMBERS!`);
    return;
  }

  const startIdx = batchNumber * batchSize;
  const endIdx = startIdx + batchSize;
  const batch = records.slice(startIdx, endIdx);
  let formatData = "";

  const responseData = `#SCTMEMBER:${socket.deviceId}${String(
    batchNumber
  ).padStart(4, "0")}`;

  for (const record of batch) {
    const formatted = formatMemberRecord(record);
    formatData = `${formatData}${formatted}`;
  }

  socket.write(`${responseData}${formatData}!`);
}

module.exports = sendMemberBatch;
