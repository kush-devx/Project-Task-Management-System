const Message = require("../models/Message.js");

// Save Chat Message
exports.saveMessage = async (projectId, senderId, text) => {
  return await Message.create({
    project: projectId,
    sender: senderId,
    text
  });
};

// Get Messages of Project
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      project: req.params.projectId
    })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};