export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Temporary dummy response for testing timeout issues
  return res.status(200).json({
    coverLetter: "This is a dummy cover letter.",
    cv: "This is a dummy CV."
  });
}