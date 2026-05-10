const Project = require("../models/Project");
const Task = require("../models/Task");

const getProjectForMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    return { error: { status: 404, message: "Project not found" } };
  }

  if (!project.isMember(userId)) {
    return { error: { status: 403, message: "Access denied" } };
  }

  return { project };
};

const ensureEditableRole = (project, userId) => {
  const role = project.getMemberRole(userId);

  if (role === "viewer") {
    return { status: 403, message: "Viewers cannot modify tasks" };
  }

  return null;
};

exports.createTask = async (req, res) => {
  try {
    const {
      projectId,
      title,
      description,
      assignedTo,
      dueDate,
      priority,
      estimatedHours,
      tags,
      status,
    } = req.body;

    if (!projectId || !title) {
      return res
        .status(400)
        .json({ message: "projectId and title are required" });
    }

    const { project, error } = await getProjectForMember(projectId, req.user.id);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const roleError = ensureEditableRole(project, req.user.id);
    if (roleError) {
      return res.status(roleError.status).json({ message: roleError.message });
    }

    if (assignedTo && !project.isMember(assignedTo)) {
      return res
        .status(400)
        .json({ message: "Assigned user must be a member of this project" });
    }

    const lastTask = await Task.findOne({ project: projectId }).sort({ order: -1 });

    const task = await Task.create({
      project: projectId,
      title: title.trim(),
      description,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
      dueDate,
      priority,
      estimatedHours,
      tags: Array.isArray(tags) ? tags : [],
      status,
      order: lastTask ? lastTask.order + 1 : 0,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email");

    res.status(201).json(populatedTask);
  } catch (error) {
    // res.status(500).json({ message: error.message });
    console.error("CREATE TASK ERROR:", error);

    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignedTo, search, sortBy = "order" } = req.query;

    const { error } = await getProjectForMember(projectId, req.user.id);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const query = { project: projectId };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortMap = {
      order: { order: 1, createdAt: -1 },
      dueDate: { dueDate: 1, createdAt: -1 },
      priority: { priority: 1, createdAt: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
    };

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email")
      .populate("comments.user", "name email")
      .sort(sortMap[sortBy] || sortMap.order);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email")
      .populate("comments.user", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { error } = await getProjectForMember(task.project, req.user.id);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { project, error } = await getProjectForMember(task.project, req.user.id);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const roleError = ensureEditableRole(project, req.user.id);
    if (roleError) {
      return res.status(roleError.status).json({ message: roleError.message });
    }

    if (req.body.assignedTo && !project.isMember(req.body.assignedTo)) {
      return res
        .status(400)
        .json({ message: "Assigned user must be a member of this project" });
    }

    const editableFields = [
      "title",
      "description",
      "assignedTo",
      "dueDate",
      "priority",
      "estimatedHours",
      "tags",
      "status",
      "order",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email")
      .populate("comments.user", "name email");

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { project, error } = await getProjectForMember(task.project, req.user.id);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const roleError = ensureEditableRole(project, req.user.id);
    if (roleError) {
      return res.status(roleError.status).json({ message: roleError.message });
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email");

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { error } = await getProjectForMember(task.project, req.user.id);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    task.comments.push({
      user: req.user.id,
      text: text.trim(),
    });

    await task.save();

    const updatedTask = await Task.findById(task._id).populate(
      "comments.user",
      "name email"
    );

    res.status(201).json(updatedTask.comments[updatedTask.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { project, error } = await getProjectForMember(task.project, req.user.id);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const roleError = ensureEditableRole(project, req.user.id);
    if (roleError) {
      return res.status(roleError.status).json({ message: roleError.message });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
