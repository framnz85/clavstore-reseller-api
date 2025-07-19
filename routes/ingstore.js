const express = require("express");
const router = express.Router();
const {
  getstores,
  updateStore,
} = require("../controllers/ingreventory/ingstore");
const { authCheck, adminGratisCheck } = require("../middlewares/auth");

router.get("/ingreventory/stores", authCheck, adminGratisCheck, getstores);
router.put(
  "/ingreventory/stores/:id",
  authCheck,
  adminGratisCheck,
  updateStore
);

module.exports = router;
