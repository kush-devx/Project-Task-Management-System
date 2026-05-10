const { GoogleGenerativeAI } = require("@google/generative-ai");
const Project = require("../models/Project");
const Task = require("../models/Task");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const extractJSONArray = (text) => {
  const cleaned = text.replace(/```json|```/gi, "").trim();
  const jsonStart = cleaned.indexOf("[");
  const jsonEnd = cleaned.lastIndexOf("]") + 1;

  if (jsonStart === -1 || jsonEnd === 0) {
    throw new Error("AI response did not contain a valid task array");
  }

  return JSON.parse(cleaned.substring(jsonStart, jsonEnd));
};

exports.improveText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `Improve the following project collaboration text.
Keep the intent the same, but make it more professional, concise, and clear.

Text:
${text.trim()}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.json({ improvedText: response.text().trim() });
  } catch (error) {
    res.status(500).json({ message: "AI improvement failed", details: error.message });
  }
};

exports.generateTasks = async (req, res) => {
  try {
    const { description, projectId } = req.body;

    if (!description?.trim() || !projectId) {
      return res
        .status(400)
        .json({ message: "Description and projectId are required" });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.isMember(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are helping a team plan a collaborative software project.
Generate 6 actionable development tasks from the project description below.
Each task should be implementation-focused and suitable for a cross-functional project collaboration platform.

Return ONLY valid JSON in this exact format:
[
  {
    "title": "Task title",
    "description": "Short explanation",
    "priority": "low|medium|high|critical"
  }
]

Project description:
${description.trim()}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const tasksFromAI = extractJSONArray(response.text());

    const lastTask = await Task.findOne({ project: projectId }).sort({ order: -1 });
    let nextOrder = lastTask ? lastTask.order + 1 : 0;

    const createdTasks = [];

    for (const task of tasksFromAI) {
      const newTask = await Task.create({
        project: projectId,
        title: task.title,
        description: task.description,
        priority: task.priority || "medium",
        status: "todo",
        createdBy: req.user.id,
        isAIGenerated: true,
        order: nextOrder++,
      });

      createdTasks.push(newTask);
    }

    res.json({
      message: "AI tasks generated successfully",
      tasks: createdTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "AI task generation failed", details: error.message });
  }
};
