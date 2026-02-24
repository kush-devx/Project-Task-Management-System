const { GoogleGenerativeAI } = require("@google/generative-ai");

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