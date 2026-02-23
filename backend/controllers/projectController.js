const Project = require("../models/Project.js");

// Create Project
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({
      title: req.body.title,
      description: req.body.description,
      createdBy: req.user.id,
      members: [req.user.id],
      deadline: req.body.deadline
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Projects of Logged-in User
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user.id
    })
      .populate("members", "name email")
      .populate("createdBy", "name");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members", "name email")
      .populate("createdBy", "name");

    if (!project)
      return res.status(404).json({ message: "Project not found" });

    if (!project.members.some(member => member._id.toString() === req.user.id))
      return res.status(403).json({ message: "Access denied" });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Member
exports.addMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Only creator can add members" });

    project.members.push(req.body.userId);
    await project.save();

    res.json({ message: "Member added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};