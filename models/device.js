const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema(
  {
    deviceid: {
      type: String,
      required: true,
      unique: true,
    },
    status: String,
    rateChartIds: Object, // Allows any structure
    effectiveDates: Object, // Allows any structure
    serverSettings: Object, // Dynamic object, no need to define every field
  },
  { strict: false, collection: "devicesList" }
);

module.exports = mongoose.model("DeviceModel", DeviceSchema);
