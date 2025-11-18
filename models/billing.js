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
    userid: ObjectId,
    billType: {
      type: String,
      enum: ["downpayment", "monthly"],
      default: "downpayment",
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
    billStatus: {
      type: String,
      enum: ["Not Billed", "Pending", "Billed"],
      default: "Not Billed",
    },
    billDeadline: Date,
    referenceNum: String,
    datePaid: Date,
  },
  { timestamps: true }
);

billingSchema.index(
  {
    packageDesc: "text",
    billType: "text",
    status: "text",
    billStatus: "text",
  },
  {
    weights: {
      packageDesc: 5,
      billType: 2,
      status: 2,
      billStatus: 2,
    },
  }
);

const Billing = (estoreid) =>
  conn[estoreid].model("GratisBilling", billingSchema);

module.exports = Billing;
