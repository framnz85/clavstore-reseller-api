const express = require("express");
const router = express.Router();
const {
  addingSubscriberApi,
  removeSubscriberApi,
  updateSubscriberApi,
} = require("../controllers/sender");
const { authCheck } = require("../middlewares/auth");

router.post("/gratis/adding-subscriber", authCheck, addingSubscriberApi);
router.post("/gratis/remove-subscriber", authCheck, removeSubscriberApi);
router.post("/gratis/update-subscriber", authCheck, updateSubscriberApi);

module.exports = router;
