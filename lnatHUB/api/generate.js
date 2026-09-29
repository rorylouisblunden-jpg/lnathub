export default async function handler(req, res) {
  // 1. Enforce POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Safe Body Parsing (Handles parsed objects or raw JSON strings)
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (parseErr) {
      return res.status(400).json({ error: 'Invalid JSON payload sent from frontend' });
    }
  }

  // Extract prompt safely across potential key naming variations
  const promptText = body?.prompt || body?.text || body?.message;

  if (!promptText) {
    return res.status(400).json({ 
      error: 'Missing prompt parameter in request body.' 
    });
  }

  // 3. Ensure API Key exists
  const apiKey = process.env.GROQ_API_KEY || process.env.LNATHUB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'GROQ_API_KEY is not configured in Vercel Environment Variables.' 
    });
  }

  try {
    // 4. Request to Groq API
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert LNAT tutor evaluating legal logic, spot-checking fallacies, and grading Section B essays."
          },
          {
            role: "user",
            content: String(promptText)
          }
        ],
        temperature: 0.5
      })
    });

    const data = await groqResponse.json();

    // 5. Catch Groq-specific response errors
    if (!groqResponse.ok) {
      console.error("Groq Error Response Payload:", data);
      const groqMsg = data.error?.message || data.error || 'Groq API rejected request';
      return res.status(groqResponse.status).json({ 
        error: `Groq Error (${groqResponse.status}): ${groqMsg}` 
      });
    }

    // 6. Return successful text generation output
    const resultText = data.choices?.[0]?.message?.content;
    
    if (!resultText) {
      return res.status(500).json({ error: 'Groq returned an empty response.' });
    }

    return res.status(200).json({ result: resultText });

  } catch (error) {
    console.error("Serverless Function Runtime Exception:", error);
    return res.status(500).json({ error: `Server Crash: ${error.message}` });
  }
}
