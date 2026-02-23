const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT.js");
const taskController = require("../controllers/taskController.js");

router.post("/", verifyJWT, taskController.createTask);
router.put("/:id/status", verifyJWT, taskController.updateTaskStatus);
router.get("/:projectId", verifyJWT, taskController.getTasksByProject);

module.exports = router;