const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const projectController = require("../controllers/projectController");

router.post("/", verifyJWT, projectController.createProject);
router.get("/", verifyJWT, projectController.getUserProjects);
router.get("/:id", verifyJWT, projectController.getProjectById);
router.put("/:id", verifyJWT, projectController.updateProject);
router.put("/:id/leave", verifyJWT, projectController.leaveProject);
router.put("/:id/remove-member", verifyJWT, projectController.removeMember);
router.patch("/:id/archive", verifyJWT, projectController.archiveProject);

module.exports = router;
