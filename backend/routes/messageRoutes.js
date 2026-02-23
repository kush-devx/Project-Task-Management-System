const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT.js");
const messageController = require("../controllers/messageController.js");

router.get("/:projectId", verifyJWT, messageController.getMessages);

module.exports = router;