const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../dbconnect/cosmic");

const remittanceSchema = new mongoose.Schema(
  {
    estoreid: {
      type: ObjectId,
      ref: "GratisEstore",
    },
    userid: {
      type: ObjectId,
      ref: "GratisUser",
    },
    remittances: [
      {
        billid: ObjectId,
        packageDesc: String,
        packageType: String,
        totalAmount: Number,
        totalRemit: Number,
        billDeadline: Date,
      },
      { timestamps: true },
    ],
    totalAmount: Number,
    totalRemit: Number,
    status: {
      type: String,
      enum: ["Pending", "Approved"],
      default: "Pending",
    },
    datePaid: Date,
  },
  { timestamps: true }
);

remittanceSchema.index({ name: "text" });

const Remittance = conn.model("GratisRemittance", remittanceSchema);

module.exports = Remittance;
