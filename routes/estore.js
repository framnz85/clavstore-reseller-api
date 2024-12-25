const express = require("express");
const router = express.Router();
const { updateEstore } = require("../controllers/estore");
const { authCheck, adminGratisCheck } = require("../middlewares/auth");

router.post(
  "/gratis/estoremain-update",
  authCheck,
  adminGratisCheck,
  updateEstore
);

module.exports = router;
