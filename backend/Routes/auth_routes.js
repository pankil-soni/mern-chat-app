const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchUser.js");
const multer = require("multer");
const {
  register,
  login,
  allUser,
  authUser,
  updateprofile,
  sendotp,
} = require("../Controllers/auth_controller.js");

const upload = multer();

router.post("/register", upload.single("profilePic"), register);
router.post("/login", login);
router.get("/login", authUser);
router.get("/", fetchuser, allUser);
router.put("/update", fetchuser, updateprofile);
router.post("/getotp", sendotp);
module.exports = router;
