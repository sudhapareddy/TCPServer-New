const fatBufModel = require("../models/fatBuf");
const fatCowModel = require("../models/fatCow");
const mongoose = require("mongoose");

// Check if the exact collection exists
async function doesCollectionExist(collectionName) {
  // Get all the collections in the database
  const collections = await mongoose.connection.db.listCollections().toArray();

  // Get an array of collection names
  const collectionNames = collections.map((c) => c.name);

  //console.log("Available collections:", collectionNames); // Debug log
  //console.log(`Checking for exact match for collection: ${collectionName}`); // Log the collection name we are checking

  // Use strict equality to ensure an exact match
  return collectionNames.some((name) => {
    console.log(name + "===" + collectionName); // Debug log to check comparison
    return name.trim() === collectionName.trim(); // Return the result of comparison
  }); // Exact match (strict comparison)
}

async function sendFatAndRateValues(command, message, socket, deviceState) {
  const milkType = command.includes("BUF") ? "FATBUF" : "FATCOW";

  const fatTableId =
    milkType === "FATBUF" ? deviceState.fatBufId : deviceState.fatCowId;

  const fatEffectiveDate =
    milkType === "FATBUF"
      ? deviceState.fatBufEffectiveDate
      : deviceState.fatCowEffectiveDate;

  // If same rate chart already sent
  if (message === `${command}:${socket.deviceId}${fatTableId}!`) {
    return socket.write("#NO NEW RATE CHART AVAILABLE!");
  }

  try {
    const deviceCollectionName =
      milkType === "FATBUF"
        ? `${socket.deviceId}_fatBufTable`
        : `${socket.deviceId}_fatCowTable`;

    const defaultCollectionName =
      milkType === "FATBUF" ? "FAT_BUF_TABLE" : "FAT_COW_TABLE";

    let collection = null;

    // 1. Try device-specific collection
    const deviceCollectionExists = await doesCollectionExist(
      deviceCollectionName
    );
    if (deviceCollectionExists) {
      console.log(`✅ Using device collection: ${deviceCollectionName}`);
      collection =
        milkType === "FATBUF"
          ? fatBufModel(deviceCollectionName)
          : fatCowModel(deviceCollectionName);
    }
    // 2. Else try default collection
    else {
      console.log(`⚠️ Device collection "${deviceCollectionName}" not found.`);

      // Now check for the fallback (default) collection with exact match
      const defaultCollectionExists = await doesCollectionExist(
        defaultCollectionName.trim()
      );
      if (defaultCollectionExists) {
        console.warn(`⚠️ Using fallback collection: ${defaultCollectionName}`);
        collection =
          milkType === "FATBUF"
            ? fatBufModel(defaultCollectionName)
            : fatCowModel(defaultCollectionName);
      }
      // 3. Neither found
      else {
        console.error(
          `❌ Neither "${deviceCollectionName}" nor "${defaultCollectionName}" collections found.`
        );
        return socket.write("#DB COLLECTIONS NOT FOUND!\n");
      }
    }

    // Proceed with data aggregation if collection was found
    const fatStats = await collection.aggregate([
      {
        $group: {
          _id: null,
          minFat: { $min: "$FAT" },
          maxFat: { $max: "$FAT" },
        },
      },
    ]);

    if (!fatStats || fatStats.length === 0) {
      console.warn("⚠️ No FAT data found.");
      return socket.write("#No FAT data found in the collection!\n");
    }

    // Get RATE values
    const rateRecords = await collection.find({}, { RATE: 1, _id: 0 });

    if (!rateRecords || rateRecords.length === 0) {
      console.warn("⚠️ No rate records found.");
      return socket.write("#No rate records found in the collection!\n");
    }

    const minFat = fatStats[0].minFat.toFixed(1).padStart(4, "0");
    const maxFat = fatStats[0].maxFat.toFixed(1).padStart(4, "0");

    const ratesData = rateRecords
      .map((record) => record.RATE.toFixed(2).padStart(6, "0"))
      .join(",");

    const responseData = `${command}:${socket.deviceId}${fatTableId}${minFat}${maxFat}${fatEffectiveDate}${ratesData}!`;

    console.log("📤 Writing to socket:", responseData);
    socket.write(responseData + "\n");
  } catch (error) {
    console.error(`❌ ${milkType} CSV Read Error:`, error.message);
    socket.write(`#DB File Error: ${error.message}!\n`);
  }
}

module.exports = sendFatAndRateValues;
