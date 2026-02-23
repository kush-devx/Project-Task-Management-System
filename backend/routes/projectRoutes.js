const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT.js");
const projectController = require("../controllers/projectController.js");

router.post("/", verifyJWT, projectController.createProject);
router.get("/", verifyJWT, projectController.getUserProjects);
router.get("/:id", verifyJWT, projectController.getProjectById);
router.put("/:id/add-member", verifyJWT, projectController.addMember);

module.exports = router;