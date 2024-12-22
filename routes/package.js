const express = require("express");
const router = express.Router();
const {
  getPackages,
  addPackage,
  updatePackage,
  deletePackage,
} = require("../controllers/package");
const { authCheck, adminGratisCheck } = require("../middlewares/auth");

router.get("/gratis/get-packages", authCheck, adminGratisCheck, getPackages);
router.post("/gratis/add-package", authCheck, adminGratisCheck, addPackage);
router.put(
  "/gratis/update-package/:packid",
  authCheck,
  adminGratisCheck,
  updatePackage
);
router.delete(
  "/gratis/delete-package/:packid",
  authCheck,
  adminGratisCheck,
  deletePackage
);

module.exports = router;
