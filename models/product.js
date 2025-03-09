const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const conn = require("../dbconnect/reseller");
const Estore = require("../models/estore");

const productSchema = new mongoose.Schema(
  {
    estoreid: {
      type: ObjectId,
      ref: Estore,
    },
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 128,
      text: true,
      index: true,
    },
    youtubeid: String,
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: 2000,
      text: true,
    },
    supplierPrice: {
      type: Number,
      trim: true,
      maxlength: 32,
      default: 0,
    },
    markup: {
      type: Number,
      trim: true,
      maxlength: 32,
      default: 0,
    },
    markupType: {
      type: String,
      enum: ["percent", "number"],
      default: "percent",
    },
    discount: {
      type: Number,
      trim: true,
      maxlength: 32,
      default: 0,
    },
    discounttype: {
      type: String,
      enum: ["percent", "number"],
      default: "percent",
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      default: 0,
      maxlength: 32,
    },
    wprice: Number,
    wcount: Number,
    wholesale: [
      {
        wprice: Number,
        wcount: Number,
      },
    ],
    category: {
      type: ObjectId,
      ref: "GratisCategory",
    },
    brand: {
      type: ObjectId,
      ref: "GratisBrand",
    },
    variantName: String,
    barcode: {
      type: String,
      maxlength: 32,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    showQuantity: {
      type: Boolean,
      default: false,
    },
    segregate: {
      type: Boolean,
      default: false,
    },
    sold: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
    },
    packaging: {
      weight: { type: Number, default: 0 },
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      volume: { type: Number, default: 0 },
    },
    rateGroup: {
      ratings: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      rateDefault: {
        ratings: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
      },
    },
    activate: {
      type: Boolean,
      default: true,
    },
    prod_code: ObjectId,
    waiting: Object,
    vatExempt: Number,
    vatExemptType: {
      type: String,
      enum: ["percent", "number"],
      default: "percent",
    },
    zeroRate: Number,
    zeroRateType: {
      type: String,
      enum: ["percent", "number"],
      default: "percent",
    },
  },
  { timestamps: true }
);

productSchema.index({ title: "text" });

const Product = (estoreid) =>
  conn[estoreid].model("GratisProduct", productSchema);

module.exports = Product;
