const PI = require('../models/PI');
const OpenAI = require('openai');

// @desc    Chat with AI about a specific student
// @route   POST /api/chat
// @access  Private (Master, Admin)
const chatWithAI = async (req, res) => {
    const { message, studentId } = req.body;

    if (!message || !studentId) {
        return res.status(400).json({ message: 'Message and Student ID are required' });
    }

    try {
        // 1. Fetch the PI for context
        let pi = await PI.findOne({ studentId: studentId });

        if (!pi) {
            if (studentId.match(/^[0-9a-fA-F]{24}$/)) {
                pi = await PI.findById(studentId);
            }
        }

        let context = "No PI found for this student.";
        if (pi) {
            // Trim context to avoid huge payloads sending 100 pages
            context = `Student Name: ${pi.studentName}\nPI Content (Excerpt):\n${pi.content.substring(0, 4000)}...`;
        }

        // 2. Configure AI Provider (Ollama Default)
        const apiKey = process.env.OPENAI_API_KEY || 'ollama';
        const baseURL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434/v1';
        const model = process.env.AI_MODEL_NAME || 'llama3';

        console.log(`DEBUG: AI Connect -> URL: ${baseURL}, Model: ${model}`);

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: baseURL
        });

        // 3. Call AI
        const systemPrompt = `You are an educational assistant for special needs.
        Use this PI context to answer. Do NOT verify you are AI.
        
        CONTEXT:
        ${context}`;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: model,
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });

    } catch (error) {
        console.error("AI Service Error:", error);
        res.status(500).json({
            message: 'Error connecting to AI (Is Ollama running?)',
            details: error.message
        });
    }
};

module.exports = { chatWithAI };
