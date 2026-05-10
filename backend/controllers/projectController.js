const Project = require("../models/Project");
const Task = require("../models/Task");

const allowedUpdateFields = [
  "title",
  "description",
  "deadline",
  "status",
  "progress",
  "tags",
  "domain",
  "techStack",
  "githubUrl",
];

const getTaskSummaryByProjectIds = async (projectIds) => {
  if (!projectIds.length) {
    return {};
  }

  const summaries = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: "$project",
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },
        inProgress: {
          $sum: {
            $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0],
          },
        },
        review: {
          $sum: {
            $cond: [{ $eq: ["$status", "review"] }, 1, 0],
          },
        },
        todo: {
          $sum: {
            $cond: [{ $eq: ["$status", "todo"] }, 1, 0],
          },
        },
      },
    },
  ]);

  return summaries.reduce((acc, item) => {
    acc[item._id.toString()] = item;
    return acc;
  }, {});
};

const sanitizeProjectPayload = (body) => {
  const payload = {};

  for (const field of allowedUpdateFields) {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  }

  return payload;
};

exports.createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      deadline,
      status,
      tags,
      domain,
      techStack,
      githubUrl,
    } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      createdBy: req.user.id,
      members: [
        {
          user: req.user.id,
          role: "owner",
        },
      ],
      deadline,
      status,
      tags: Array.isArray(tags) ? tags : [],
      domain,
      techStack: Array.isArray(techStack) ? techStack : [],
      githubUrl,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("members.user", "name email role")
      .populate("createdBy", "name email");

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserProjects = async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === "true";

    const projects = await Project.find({
      "members.user": req.user.id,
      ...(includeArchived ? {} : { isArchived: false }),
    })
      .populate("members.user", "name email role")
      .populate("createdBy", "name email")
      .sort({ updatedAt: -1 });

    const summaryMap = await getTaskSummaryByProjectIds(
      projects.map((project) => project._id)
    );

    res.json(
      projects.map((project) => {
        const projectSummary = summaryMap[project._id.toString()] || {
          total: 0,
          completed: 0,
          inProgress: 0,
          review: 0,
          todo: 0,
        };

        return {
          ...project.toObject(),
          taskSummary: projectSummary,
        };
      })
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members.user", "name email role college department")
      .populate("createdBy", "name email role");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
      console.log("REQ USER:", req.user.id);
    }
    console.log(
      "PROJECT MEMBERS:",
      project.members.map((m) => ({
        user: m.user.toString(),
        role: m.role,
      }))
    );

    if (!project.isMember(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const tasks = await Task.find({ project: project._id })
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email")
      .sort({ order: 1, createdAt: -1 });

    const taskSummary = tasks.reduce(
      (summary, task) => {
        summary.total += 1;
        summary[task.status] += 1;
        return summary;
      },
      {
        total: 0,
        todo: 0,
        "in-progress": 0,
        review: 0,
        completed: 0,
      }
    );

    res.json({
      ...project.toObject(),
      taskSummary,
      tasks,
      currentUserRole: project.getMemberRole(req.user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.isOwner(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only the owner can update project details" });
    }

    const updates = sanitizeProjectPayload(req.body);
    Object.assign(project, updates);

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("members.user", "name email role")
      .populate("createdBy", "name email");

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.leaveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.isMember(req.user.id)) {
      return res.status(403).json({ message: "You are not a project member" });
    }

    if (project.isOwner(req.user.id)) {
      return res.status(400).json({
        message:
          "Project owner cannot leave directly. Transfer ownership or archive the project first.",
      });
    }

    project.members = project.members.filter(
      (member) => member.user.toString() !== req.user.id
    );

    await project.save();

    res.json({ message: "Left project successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.isOwner(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only the project owner can remove members" });
    }

    if (userId === req.user.id) {
      return res.status(400).json({
        message:
          "Owner cannot remove themselves. Use a transfer ownership flow before leaving.",
      });
    }

    const memberExists = project.isMember(userId);
    if (!memberExists) {
      return res.status(404).json({ message: "Member not found in project" });
    }

    project.members = project.members.filter(
      (member) => member.user.toString() !== userId
    );

    await project.save();

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.archiveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.isOwner(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only the owner can archive a project" });
    }

    project.isArchived = req.body.isArchived ?? true;
    await project.save();

    res.json({
      message: project.isArchived
        ? "Project archived successfully"
        : "Project restored successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
