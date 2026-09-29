export default async function handler(req, res) {
  // Ensure only POST requests are allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  // Check if the API key is configured
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'API key not configured on server.' } });
  }

  try {
    // Make a POST request to the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body) // Send the request body to the API
      }
    );

    // Parse the JSON response from the API
    const data = await response.json();
    // Return the API response and its status code
    return res.status(response.status).json(data);
  } catch (error) {
    // Handle any errors during the fetch operation
    return res.status(500).json({ error: { message: error.message } });
  }
}