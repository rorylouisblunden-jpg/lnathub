export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Model options: "llama-3.3-70b-versatile" or "llama-3.1-8b-instant"
        model: "llama-3.3-70b-versatile", 
        messages: [
          { 
            role: "system", 
            content: "You are an expert LNAT tutor evaluating legal reasoning, spot-checking logical fallacies, and analyzing Section B essay structures." 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.5,
        max_tokens: 1500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Groq API Error' });
    }

    // Extract generated text from the OpenAI-style JSON response
    const outputText = data.choices[0].message.content;
    return res.status(200).json({ result: outputText });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
