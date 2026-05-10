const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT.js");
const taskController = require("../controllers/taskController.js");

router.post("/", verifyJWT, taskController.createTask);
router.get("/project/:projectId", verifyJWT, taskController.getTasksByProject);
router.get("/:id", verifyJWT, taskController.getTaskById);
router.put("/:id", verifyJWT, taskController.updateTask);
router.put("/:id/status", verifyJWT, taskController.updateTaskStatus);
router.post("/:id/comments", verifyJWT, taskController.addComment);
router.delete("/:id", verifyJWT, taskController.deleteTask);

module.exports = router;
