const express = require("express");
const router = express.Router();
const {
  getUserDetails,
  getResellerUsers,
  updateCustomer,
  resetPassword,
} = require("../controllers/user");
const { authCheck } = require("../middlewares/auth");

router.get("/gratis/user-details/:resellid", authCheck, getUserDetails);
router.post("/gratis/owner-users/:resellid", authCheck, getResellerUsers);
router.put("/gratis/update-customer/:userid", authCheck, updateCustomer);
router.put("/gratis/reset-password-customer/:userid", authCheck, resetPassword);

module.exports = router;
