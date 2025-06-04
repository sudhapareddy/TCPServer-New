// //const FatBuf = require("../models/fatBuf"); // Import the model

// const snfBufModel = require("../models/snfBuf");
// //const snfBufTable = snfBufModel("SNF_BUF_TABLE");

// //const FatCow = require("../models/fatCow");

// const snfCowModel = require("../models/snfCow");
// //const snfCowTable = snfCowModel("SNF_COW_TABLE");

// //const db = mongoose.connection;

// async function getMinMaxFatSnf(milkTable) {
//   try {
//     const DynamicCollection =
//       milkTable === "SNFBUF"
//         ? snfBufModel("SNF_BUF_TABLE")
//         : snfCowModel("SNF_COW_TABLE"); // Change if needed
//     const snfCowData = await DynamicCollection.findOne({}); // Fetch JSON data

//     if (!snfCowData) {
//       console.error("No data found in MongoDB!");
//       return;
//     }

//     // ✅ Extract FAT keys & sort
//     const fatKeys = Object.keys(snfCowData)
//       .map(Number)
//       .filter((num) => !isNaN(num))
//       .sort((a, b) => a - b);

//     const minFat = fatKeys.length
//       ? fatKeys[0].toFixed(1).padStart(4, "0")
//       : "0000.0";
//     const maxFat = fatKeys.length
//       ? fatKeys[fatKeys.length - 1].toFixed(1).padStart(4, "0")
//       : "0000.0";

//     let snfValues = new Set();
//     let fatRateMapping = {};

//     // ✅ Extract SNF values properly
//     fatKeys.forEach((fat) => {
//       const fatStr = fat.toFixed(1);
//       const rates = snfCowData[fatStr].map((entry) => {
//         const snf = Object.keys(entry)[0]; // Extract SNF key
//         const rate = entry[snf]; // Extract Rate
//         snfValues.add(parseFloat(snf)); // Store SNF for min/max
//         return parseFloat(rate).toFixed(2).padStart(6, "0"); // Format as "009.50"
//       });

//       // ✅ Store rates in a comma-separated string
//       fatRateMapping[fatStr] = rates.length ? rates.join(",") : "";
//     });

//     // ✅ Get min/max SNF values
//     const sortedSnf = Array.from(snfValues).sort((a, b) => a - b);
//     const minSnf = sortedSnf.length
//       ? sortedSnf[0].toFixed(1).padStart(4, "0")
//       : "0000.0";
//     const maxSnf = sortedSnf.length
//       ? sortedSnf[sortedSnf.length - 1].toFixed(1).padStart(4, "0")
//       : "0000.0";

//     return { minFat, maxFat, minSnf, maxSnf, fatRateMapping };
//   } catch (error) {
//     console.error("Error processing data:", error);
//   } finally {
//   }
// }

// module.exports = getMinMaxFatSnf;

const snfBufModel = require("../models/snfBuf");
const snfCowModel = require("../models/snfCow");
const mongoose = require("mongoose");

/**
 * @param {string} milkTable - Either 'SNFBUF' or 'SNFCOW'
 * @param {string} [customCollectionName] - Optional custom collection name like 'sct0001_march'
 */
async function getMinMaxFatSnf(milkTable, socket) {
  try {
    const db = mongoose.connection.db;
    let dataSource;

    customCollectionName =
      milkTable === "SNFBUF"
        ? `${socket.deviceId}_snfBufTable`
        : `${socket.deviceId}_snfCowTable`;

    if (customCollectionName) {
      const collections = await db.listCollections().toArray();
      const match = collections.find(
        (col) => col.name === customCollectionName
      );

      if (match) {
        console.log(`Using custom collection: ${customCollectionName}`);
        dataSource =
          milkTable === "SNFBUF"
            ? snfBufModel(customCollectionName)
            : snfCowModel(customCollectionName);
      } else {
        console.warn(
          `Custom collection '${customCollectionName}' not found, falling back.`
        );
      }
    }

    // Fallback to default if custom collection is not provided or not found
    if (!dataSource) {
      dataSource =
        milkTable === "SNFBUF"
          ? snfBufModel("SNF_BUF_TABLE")
          : snfCowModel("SNF_COW_TABLE");
    }

    const data = await dataSource.findOne({});
    if (!data) {
      console.error("No data found in the selected MongoDB collection!");
      return;
    }

    // ✅ Extract FAT keys & sort
    const fatKeys = Object.keys(data)
      .map(Number)
      .filter((num) => !isNaN(num))
      .sort((a, b) => a - b);

    const minFat = fatKeys.length
      ? fatKeys[0].toFixed(1).padStart(4, "0")
      : "0000.0";
    const maxFat = fatKeys.length
      ? fatKeys[fatKeys.length - 1].toFixed(1).padStart(4, "0")
      : "0000.0";

    let snfValues = new Set();
    let fatRateMapping = {};

    fatKeys.forEach((fat) => {
      const fatStr = fat.toFixed(1);
      const entries = data[fatStr] || [];
      const rates = entries.map((entry) => {
        const snf = Object.keys(entry)[0];
        const rate = entry[snf];
        snfValues.add(parseFloat(snf));
        return parseFloat(rate).toFixed(2).padStart(6, "0");
      });

      fatRateMapping[fatStr] = rates.length ? rates.join(",") : "";
    });

    const sortedSnf = Array.from(snfValues).sort((a, b) => a - b);
    const minSnf = sortedSnf.length
      ? sortedSnf[0].toFixed(1).padStart(4, "0")
      : "0000.0";
    const maxSnf = sortedSnf.length
      ? sortedSnf[sortedSnf.length - 1].toFixed(1).padStart(4, "0")
      : "0000.0";

    return { minFat, maxFat, minSnf, maxSnf, fatRateMapping };
  } catch (error) {
    console.error("Error processing data:", error);
  }
}

module.exports = getMinMaxFatSnf;
