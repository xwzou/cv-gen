export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { jobDescription, experience } = req.body;
  if (!jobDescription || !experience) {
    return res.status(400).json({ error: 'Missing job description or experience' });
  }

  // Construct a prompt that instructs the model to output a JSON object.
  const prompt = `
Please generate a cover letter and a CV based on the details below.

Job Description:
${jobDescription}

Experience:
${experience}

Return the output as a valid JSON object with exactly two keys:
{
  "coverLetter": "cover letter content",
  "cv": "cv content"
}
`;

  try {
    // Call the OpenRouter API with the updated endpoint and payload
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://cover-letter-and-cv-generator.vercel.app',
        'X-Title': 'Cover Letter and CV Generator',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API responded with status ${response.status}`);
    }

    const apiResult = await response.json();

    // Get the content from the API response (assuming it follows the ChatCompletion format)
    const messageContent = apiResult.choices[0].message.content;

    // Attempt to parse the returned content as JSON
    let resultJSON;
    try {
      resultJSON = JSON.parse(messageContent);
    } catch (err) {
      throw new Error(`Failed to parse API response as JSON. Response was: ${messageContent}`);
    }

    // Set CORS header if needed and return the parsed JSON
    res.setHeader('Access-Control-Allow-Origin', 'https://cover-letter-and-cv-generator.vercel.app');
    res.status(200).json(resultJSON);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
