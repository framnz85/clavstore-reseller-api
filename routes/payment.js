const express = require("express");
const router = express.Router();
const {
  getPayments,
  addPayment,
  updatePayment,
  deletePayment,
} = require("../controllers/payment");
const { authCheck, adminGratisCheck } = require("../middlewares/auth");

router.get("/gratis/get-payments", authCheck, adminGratisCheck, getPayments);
router.post("/gratis/add-payment", authCheck, adminGratisCheck, addPayment);
router.put(
  "/gratis/update-payment/:payid",
  authCheck,
  adminGratisCheck,
  updatePayment
);
router.delete(
  "/gratis/delete-payment/:payid",
  authCheck,
  adminGratisCheck,
  deletePayment
);

module.exports = router;
