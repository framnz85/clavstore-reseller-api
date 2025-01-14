const express = require("express");
const router = express.Router();
const {
  getBillings,
  getBillingsByEstore,
  createBilling,
  updateBilling,
} = require("../controllers/billing");
const { authCheck } = require("../middlewares/auth");

router.get("/gratis/get-billings", authCheck, getBillings);
router.get("/gratis/get-billings/:estoreid", authCheck, getBillingsByEstore);
router.post("/gratis/create-billing", authCheck, createBilling);
router.put("/gratis/update-billing/:billid", authCheck, updateBilling);

module.exports = router;
