const express = require("express");
const router = express.Router();
const {
  register,
  login,
  authUser,
  sendotp,
} = require("../Controllers/auth_controller.js");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authUser);
router.post("/getotp", sendotp);
module.exports = router;
