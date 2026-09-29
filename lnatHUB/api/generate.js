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
        model: "llama3-70b-8192", // Recommended high-reasoning model
        messages: [
          { 
            role: "system", 
            content: "You are an expert LNAT tutor evaluating legal reasoning, spot-checking logical fallacies, and analyzing Section B essay structures." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Logs the exact error message from Groq if something is wrong
      console.error("Groq Error Response:", data);
      return res.status(response.status).json({ error: data.error?.message || 'Groq API Error' });
    }

    const outputText = data.choices[0].message.content;
    return res.status(200).json({ result: outputText });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
