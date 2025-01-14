const jwt = require("jsonwebtoken");
const md5 = require("md5");

const User = require("../models/user");

exports.loginUser = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let tokenObj = { email };

  try {
    const user = await User.findOne({ email, password: md5(password) }).exec();
    if (user) {
      if (user && user.role === "admin" && user.emailConfirm) {
        tokenObj = {
          ...tokenObj,
          aud: "clavmall-estore",
          email_verified: true,
        };
      }
      token = jwt.sign(tokenObj, process.env.JWT_PRIVATE_KEY);
      res.json(token);
    } else {
      res.json({ err: "Invalid email or password." });
    }
  } catch (error) {
    res.json({ err: "Fetching user information fails. " + error.message });
  }
};
