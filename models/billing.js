const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../dbconnect/reseller");
const Package = require("../models/package");
const Payment = require("../models/payment");

const billingSchema = new mongoose.Schema(
  {
    estoreid: ObjectId,
    package: {
      type: ObjectId,
      ref: Package,
    },
    packageDesc: String,
    totalAmount: Number,
    bank: {
      type: ObjectId,
      ref: Payment,
    },
    status: {
      type: String,
      enum: ["Unpaid", "Pending", "Paid"],
      default: "Unpaid",
    },
    payDeadline: Date,
    approval: {
      type: String,
      enum: ["For Approval", "Pending", "Approved"],
      default: "For Approval",
    },
    appDeadline: Date,
    referenceNum: String,
    datePaid: Date,
  },
  { timestamps: true }
);

billingSchema.index({ name: "text" });

const Billing = (estoreid) =>
  conn[estoreid].model("GratisBilling", billingSchema);

module.exports = Billing;
