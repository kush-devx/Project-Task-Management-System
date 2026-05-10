const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const invitationController = require("../controllers/invitationController");

router.post("/", verifyJWT, invitationController.sendInvite);
router.get("/received", verifyJWT, invitationController.getReceivedInvites);
router.get("/sent", verifyJWT, invitationController.getSentInvites);
router.put("/:id/accept", verifyJWT, invitationController.acceptInvite);
router.put("/:id/reject", verifyJWT, invitationController.rejectInvite);
router.delete("/:id", verifyJWT, invitationController.cancelInvite);

module.exports = router;
