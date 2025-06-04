require("dotenv").config();
require("./db"); // connects to MongoDB

console.log("sudha");

const net = require("net");

const sendServerSettings = require("./getServerSettings");

const addMember = require("./Members/addMember");
const updateMemberRecord = require("./Members/updateMember");
const deleteAllMemberRecords = require("./Members/deleteAllMembers");

const sendRateChartIds = require("./RateTables/GetRatechartIds");
const sendFatAndRateValues = require("./RateTables/GetFatRates");

const sendSnfLimits = require("./RateTables/sendSnfLimits");
const sendSnfRates = require("./RateTables/sendSnfRates");

const isDeviceRegistered = require("./findDevice");
const saveRecords = require("./Add_Transaction_Records");

const getMemberCount = require("./Members/getMemberCount");
const sendMemberBatch = require("./Members/SendMembers");

const HOST = "0.0.0.0";
const PORT = 3699;

const activeConnections = new Map();
const deviceStates = new Map();

function extractDeviceId(message) {
  const match = message.match(/:([A-Z0-9]{7})/);
  return match ? match[1] : null;
}

console.log("📦 All env vars:", JSON.stringify(process.env, null, 2));

const server = net.createServer((socket) => {
  console.log(
    `✅ IoT Device Connected: ${socket.remoteAddress}:${socket.remotePort}`
  );
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;

  activeConnections.set(clientAddress, socket);

  socket.setTimeout(30000); // Set idle timeout for socket
  socket.on("timeout", () => {
    console.log(`⌛ Timeout: ${clientAddress}`);
    socket.end();
  });

  socket.on("data", async (data) => {
    const message = data.toString().trim();
    console.log(`📩 Received: ${message}`);

    try {
      const [command, payload] = message.split(":");

      //console.log("command:" + command, "payload:" + payload);

      if (command.startsWith("#SCTSTART")) {
        const deviceId = extractDeviceId(message);
        if (!socket.deviceId) {
          socket.deviceId = deviceId;
          activeConnections.set(deviceId, socket);
        }
        if (!deviceStates.has(deviceId)) {
          deviceStates.set(deviceId, {
            fatCowId: null,
            fatBufId: null,
            snfCowId: null,
            snfBufId: null,
            fatBufEffectiveDate: null,
            fatCowEffectiveDate: null,
            snfBufEffectiveDate: null,
            snfCowEffectiveDate: null,
            fatsnfRateMapping: {},
            snfBufRecord: 0,
            snfCowRecord: 0,
            memberData: null,
          });
        }
        const deviceInfo = await isDeviceRegistered(deviceId);
        if (deviceInfo?.status === "active") {
          socket.write(`${command}:${deviceId}!`);
        } else {
          socket.write(`#MACHINE NOT ADDED!`);
        }
        return;
      }

      if (!socket.deviceId) {
        socket.write("#DEVICE NOT REGISTERED YET!\n");
        console.log("#DEVICE NOT REGISTERED YET!\n");
        return;
      }

      const deviceState = deviceStates.get(socket.deviceId);

      if (command === "#SCTSYNCRECORDS") {
        return saveRecords(data, socket);
      }

      switch (command) {
        case "#SCTENDSHIFT":
          return socket.write(`#SCTENDSHIFT:${socket.deviceId}!`);

        case `#SCTADDMEMBER`:
          return addMember(message, socket);

        case `#SCTEDITMEMBER`:
          return updateMemberRecord(message, socket);

        case `#SCTDELETEALL`:
          return await deleteAllMemberRecords(socket);

        case `#SCTMEMBERCOUNT`:
          return getMemberCount(socket, deviceState); // Call the new function

        case `#SCTMEMBER`:
          //const state = deviceStates.get(deviceId);

          return sendMemberBatch(socket, deviceState, payload);

        case `#SCTSERVERVALUE2`:
          return await sendServerSettings(socket);

        case `#SCTRATECHARTIDS`:
          return await sendRateChartIds(socket, deviceState); // Handle rate chart IDs

        case `#SCTSNFBUFLIMITS`:
        case `#SCTSNFCOWLIMITS`:
          await sendSnfLimits(command, message, socket, deviceState);

        case `#SCTSNFBUFRECORD`:
        case `#SCTSNFCOWRECORD`:
          sendSnfRates(command, message, socket, deviceState);

        case `#SCTSNFBUFEND`:
        case `#SCTSNFCOWEND`:
          return socket.write(
            `#${command.slice(1)}:${socket.deviceId}${
              command.includes("BUF")
                ? deviceState.snfBufId
                : deviceState.snfCowId
            }!`
          );

        case `#SCTFATBUFRECORD`:
        case `#SCTFATCOWRECORD`:
          return sendFatAndRateValues(command, message, socket, deviceState);

        //sendFatRates(command, message, socket, deviceState);

        case `#SCTFATBUFEND`:
        case `#SCTFATCOWEND`:
          return socket.write(
            `#${command.slice(1)}:${socket.deviceId}${
              command.includes("BUF")
                ? deviceState.fatBufId
                : deviceState.fatCowId
            }!`
          );

        default:
          return socket.write("#INVALID COMMAND!\n");
      }
    } catch (err) {
      console.error("❌ Error processing message:", err);
      socket.write("#INTERNAL SERVER ERROR\n");
    }
  });

  socket.on("error", (err) => {
    console.error(`❌ Socket error from ${clientAddress}:`, err.message);
    if (socket.deviceId) activeConnections.delete(socket.deviceId);
    activeConnections.delete(clientAddress);
  });

  socket.on("end", () => {
    console.log(`🔌 Connection ended: ${clientAddress}`);
    if (socket.deviceId) activeConnections.delete(socket.deviceId);
    activeConnections.delete(clientAddress);
  });

  socket.on("close", () => {
    console.log(`🔌 IoT Device Disconnected: ${clientAddress}`);
    if (socket.deviceId) activeConnections.delete(socket.deviceId);
    activeConnections.delete(clientAddress);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 TCP Server running on ${HOST}:${PORT}`);
});
