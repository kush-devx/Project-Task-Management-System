const Message = require("../models/Message");

// Get Messages of Project
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      project: req.params.projectId,
    })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};