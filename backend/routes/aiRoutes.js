const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const verifyJWT = require("../middleware/verifyJWT");

router.post("/improve", verifyJWT, aiController.improveText);
router.post("/generate-tasks", verifyJWT, aiController.generateTasks);

module.exports = router;
