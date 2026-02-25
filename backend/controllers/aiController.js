const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require("../models/Task");

// Initialize the API with your key 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.improveText = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Text is required" });
        }

        // Fix: Explicitly use the model version string
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash", // Use the latest stable version
        });

        const result = await model.generateContent(text);
        const response = await result.response;
        const improvedText = response.text();

        res.json({ improvedText });

    } catch (error) {
        // Log the full error to help debug further
        console.error("Gemini Error:", error);
        res.status(500).json({ message: "AI failed", details: error.message });
    }
};
  

exports.generateTasks = async (req, res) => {
  try {
    const { description, projectId } = req.body;

    if (!description || !projectId) {
      return res.status(400).json({ message: "Description and projectId required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Generate 5 development tasks for this project.
Return result in this EXACT JSON format:

[
  {
    "title": "Task title",
    "description": "Short description"
  }
]

Project description:
${description}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("AI RAW RESPONSE:", text);

    // Extract JSON safely
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);

    const tasksFromAI = JSON.parse(jsonString);

    const createdTasks = [];

    for (let task of tasksFromAI) {
      const newTask = await Task.create({
        project: projectId,
        title: task.title,
        description: task.description,
        status: "todo"
      });

      createdTasks.push(newTask);
    }

    res.json({
      message: "AI tasks generated successfully",
      tasks: createdTasks
    });

  } catch (error) {
    console.error("AI Generate Error:", error);
    res.status(500).json({ message: "AI task generation failed" });
  }
};