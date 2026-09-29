export default async function handler(req, res) {
  // 1. Only allow POST requests from your HTML form
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Extract the user input sent by your HTML script
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body' });
  }

  try {
    // 3. Make the API call to Groq
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
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
        temperature: 0.5
      })
    });

    const data = await response.json();

    // 4. Catch errors returned directly from Groq
    if (!response.ok) {
      console.error("Groq Raw Error Output:", JSON.stringify(data));
      return res.status(response.status).json({ 
        error: data.error?.message || 'Groq API returned an error' 
      });
    }

    // 5. Send back the generated text to your HTML page
    const outputText = data.choices[0].message.content;
    return res.status(200).json({ result: outputText });

  } catch (error) {
    console.error("Serverless Crash:", error);
    return res.status(500).json({ error: error.message });
  }
}
