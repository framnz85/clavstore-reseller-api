const express = require("express");
const router = express.Router();
const {
  getEstore,
  getEstores,
  getEstoresBilling,
  updateEstore,
  approveCosmic,
  updateEstoreReseller,
  updateAffiliate,
} = require("../controllers/estoreresell");
const { authCheck, adminGratisCheck } = require("../middlewares/auth");

router.get("/gratis/estore", authCheck, adminGratisCheck, getEstore);
router.post("/gratis/estores", authCheck, adminGratisCheck, getEstores);
router.post(
  "/gratis/estores-billing",
  authCheck,
  adminGratisCheck,
  getEstoresBilling
);
router.post("/gratis/estore-update", authCheck, adminGratisCheck, updateEstore);
router.put(
  "/gratis/approve-cosmic",
  authCheck,
  adminGratisCheck,
  approveCosmic
);
router.put(
  "/gratis/update-estore-reseller",
  authCheck,
  adminGratisCheck,
  updateEstoreReseller
);
router.put(
  "/gratis/update-affiliate/:refid",
  authCheck,
  adminGratisCheck,
  updateAffiliate
);

module.exports = router;
