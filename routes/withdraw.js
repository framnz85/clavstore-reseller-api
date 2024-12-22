const express = require("express");
const router = express.Router();
const {
  getAllAffiliates,
  getAllWithdrawals,
} = require("../controllers/withdraw");
const { authCheck } = require("../middlewares/auth");

router.post("/gratis/get-all-affiliates", authCheck, getAllAffiliates);
router.post("/gratis/get-all-withdrawals", authCheck, getAllWithdrawals);

module.exports = router;
