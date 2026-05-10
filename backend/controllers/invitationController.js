const Invitation = require("../models/Invitation");
const Project = require("../models/Project");
const User = require("../models/User");

exports.sendInvite = async (req, res) => {
  try {
    const { projectId, receiverId, role, message } = req.body;

    if (!projectId || !receiverId) {
      return res.status(400).json({
        message: "projectId and receiverId are required",
      });
    }

    if (receiverId === req.user.id) {
      return res
        .status(400)
        .json({ message: "You cannot invite yourself to the project" });
    }

    const [project, receiver] = await Promise.all([
      Project.findById(projectId),
      User.findById(receiverId),
    ]);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    if (!project.isOwner(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only project owner can send invites" });
    }

    if (project.isMember(receiverId)) {
      return res
        .status(400)
        .json({ message: "User is already a project member" });
    }

    const existingInvite = await Invitation.findOne({
      project: projectId,
      receiver: receiverId,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (existingInvite) {
      return res.status(400).json({ message: "Invitation already sent" });
    }

    const invitation = await Invitation.create({
      project: projectId,
      sender: req.user.id,
      receiver: receiverId,
      role: role || "member",
      message,
    });

    const populatedInvitation = await Invitation.findById(invitation._id)
      .populate("project", "title description")
      .populate("sender", "name email")
      .populate("receiver", "name email");

    const io = req.app.get("io");
    if (io) {
      io.to(receiverId).emit("newInvite", populatedInvitation);
    }

    res.status(201).json({
      message: "Invitation sent successfully",
      invitation: populatedInvitation,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to send invitation" });
  }
};

exports.getReceivedInvites = async (req, res) => {
  try {
    const invites = await Invitation.find({
      receiver: req.user.id,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("project", "title description status")
      .populate("sender", "name email role")
      .sort({ createdAt: -1 });

    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invitations" });
  }
};

exports.getSentInvites = async (req, res) => {
  try {
    const invites = await Invitation.find({ sender: req.user.id })
      .populate("project", "title")
      .populate("receiver", "name email role")
      .sort({ createdAt: -1 });

    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sent invitations" });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const invite = await Invitation.findById(req.params.id);

    if (!invite) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invite.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (invite.status !== "pending") {
      return res.status(400).json({ message: "Invite already handled" });
    }

    if (invite.expiresAt <= new Date()) {
      invite.status = "expired";
      await invite.save();
      return res.status(400).json({ message: "Invitation has expired" });
    }

    const project = await Project.findById(invite.project);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.isMember(req.user.id)) {
      project.members.push({
        user: req.user.id,
        role: invite.role || "member",
      });
      await project.save();
    }

    invite.status = "accepted";
    await invite.save();

    res.json({
      message: "Invitation accepted successfully",
      role: invite.role || "member",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to accept invitation" });
  }
};

exports.rejectInvite = async (req, res) => {
  try {
    const invite = await Invitation.findById(req.params.id);

    if (!invite) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invite.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (invite.status !== "pending") {
      return res.status(400).json({ message: "Invite already handled" });
    }

    invite.status = "rejected";
    await invite.save();

    res.json({ message: "Invitation rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject invitation" });
  }
};

exports.cancelInvite = async (req, res) => {
  try {
    const invite = await Invitation.findById(req.params.id);

    if (!invite) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (invite.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (invite.status !== "pending") {
      return res.status(400).json({ message: "Only pending invites can be cancelled" });
    }

    await invite.deleteOne();

    res.json({ message: "Invitation cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel invitation" });
  }
};
