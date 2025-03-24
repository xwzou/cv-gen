export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { jobDescription, experience } = req.body;
  if (!jobDescription || !experience) {
    return res.status(400).json({ error: 'Missing job description or experience' });
  }

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

  // Setup an AbortController to timeout if the external API takes too long
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

  try {
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
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter API responded with status ${response.status}: ${text}`);
    }

    const apiResult = await response.json();
    const messageContent = apiResult.choices[0].message.content;
    // Remove Markdown code fences if present
    const cleanedContent = messageContent
      .replace(/```json\s*/g, '')
      .replace(/```/g, '')
      .trim();

    let resultJSON;
    try {
      resultJSON = JSON.parse(cleanedContent);
    } catch (err) {
      throw new Error(`Failed to parse API response as JSON. Cleaned response was: ${cleanedContent}`);
    }

    res.setHeader('Access-Control-Allow-Origin', 'https://cover-letter-and-cv-generator.vercel.app');
    res.status(200).json(resultJSON);
  } catch (error) {
    console.error('Error in generate.js:', error);
    res.status(500).json({ error: error.message });
  }
}
