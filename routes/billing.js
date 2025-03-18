const express = require("express");
const router = express.Router();
const {
  getBillings,
  getNotRemitted,
  getBillingsByEstore,
  createBilling,
  updateBilling,
} = require("../controllers/billing");
const { authCheck } = require("../middlewares/auth");

router.get("/gratis/get-billings/:estoreid", authCheck, getBillingsByEstore);
router.get("/gratis/get-not-remitted", authCheck, getNotRemitted);
router.post("/gratis/get-billings", authCheck, getBillings);
router.post("/gratis/create-billing", authCheck, createBilling);
router.put("/gratis/update-billing/:billid", authCheck, updateBilling);

module.exports = router;
