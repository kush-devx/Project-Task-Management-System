const Task = require("../models/Task.js");
const Project = require("../models/Project.js");

// Create Task
exports.createTask = async (req, res) => {
  try {
    const project = await Project.findById(req.body.projectId);

    if (!project.members.some(
  member => member.toString() === req.user.id
))
      return res.status(403).json({ message: "Access denied" });

    const task = await Task.create({
      project: req.body.projectId,
      title: req.body.title,
      description: req.body.description,
      assignedTo: req.body.assignedTo,
      dueDate: req.body.dueDate
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Task Status
exports.updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");

    if (!task.project.members.some(
  member => member.toString() === req.user.id
))
      return res.status(403).json({ message: "Access denied" });

    task.status = req.body.status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Tasks by Project
exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({
      project: req.params.projectId
    }).populate("assignedTo", "name");

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};