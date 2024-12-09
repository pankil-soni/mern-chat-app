const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer();

const {
  sendMessage,
  allMessage,
  deletemesage,
  getPresignedUrl,
} = require("../Controllers/message_controller.js");
const fetchuser = require("../middleware/fetchUser.js");

router.get("/presigned-url", fetchuser, getPresignedUrl);
router.get("/:id/:userid", fetchuser, allMessage);
router.post("/send", fetchuser, upload.single("file"), sendMessage);
router.post("/delete", fetchuser, deletemesage);

module.exports = router;
