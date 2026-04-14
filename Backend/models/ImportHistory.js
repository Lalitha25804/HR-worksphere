const mongoose = require("mongoose");

const importHistorySchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileSize: { type: Number },
  recordsProcessed: { type: Number, default: 0 },
  failedRecords: { type: Number, default: 0 },
  status: { type: String, enum: ["Success", "Partial", "Failed"], default: "Success" }
}, { timestamps: true });

module.exports = mongoose.model("ImportHistory", importHistorySchema);
