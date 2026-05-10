const Message = require("../models/Message");
const Project = require("../models/Project");

const getAuthorizedProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    return { error: { status: 404, message: "Project not found" } };
  }

  if (!project.isMember(userId)) {
    return { error: { status: 403, message: "Access denied" } };
  }

  return { project };
};

exports.getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;

    const { error } = await getAuthorizedProject(projectId, req.user.id);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const messages = await Message.find({ project: projectId })
      .populate("sender", "name email role")
      .populate("replyTo", "content sender")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { projectId, content, type, fileUrl, replyTo } = req.body;

    if (!projectId || !content?.trim()) {
      return res
        .status(400)
        .json({ message: "projectId and content are required" });
    }

    const { error } = await getAuthorizedProject(projectId, req.user.id);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const message = await Message.create({
      project: projectId,
      sender: req.user.id,
      content: content.trim(),
      type: type || "text",
      fileUrl,
      replyTo: replyTo || null,
      readBy: [{ user: req.user.id }],
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email role")
      .populate("replyTo", "content sender");

    const io = req.app.get("io");
    if (io) {
      io.to(projectId).emit("newMessage", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message" });
  }
};
