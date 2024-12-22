const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/auth");

router.post("/gratis/auth-login", loginUser);

module.exports = router;
