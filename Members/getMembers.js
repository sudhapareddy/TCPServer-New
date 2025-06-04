const getRecordModel = require("../models/members");

async function fetchAllRecords(deviceId) {
  try {
    const MembersList = getRecordModel(`${deviceId}_membersList`);

    // Get all member records (no limit)
    const records = await MembersList.find(
      {},
      {
        _id: 0,
        CODE: 1,
        MILKTYPE: 1,
        COMMISSIONTYPE: 1,
        MEMBERNAME: 1,
        CONTACTNO: 1,
        STATUS: 1,
      }
    );

    // Format each record
    const formattedRecords = records.map((record) => [
      record.CODE,
      record.MILKTYPE,
      record.COMMISSIONTYPE,
      record.MEMBERNAME.padEnd(20, " "),
      record.CONTACTNO.padEnd(10, " "),
      record.STATUS,
    ]);

    // Return total count and records
    return {
      totalCount: records.length,
      records: formattedRecords,
    };
  } catch (error) {
    console.error("Error fetching records:", error);
    return {
      totalCount: 0,
      records: [],
    };
  }
}

module.exports = fetchAllRecords;
