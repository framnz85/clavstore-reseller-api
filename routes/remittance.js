const express = require("express");
const router = express.Router();
const {
  getRemittancess,
  createRemittance,
  editRemittance,
  approveRemittance,
  deleteRemittance,
} = require("../controllers/remittance");
const { authCheck } = require("../middlewares/auth");

router.post("/gratis/get-remittances", authCheck, getRemittancess);
router.post("/gratis/create-remittance", authCheck, createRemittance);
router.put("/gratis/edit-remittance/:remitid", authCheck, editRemittance);
router.put("/gratis/approve-remittance/:remitid", authCheck, approveRemittance);
router.delete(
  "/gratis/delete-remittance/:remitid",
  authCheck,
  deleteRemittance
);

module.exports = router;
