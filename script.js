document.getElementById('inputForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const jobDescription = document.getElementById('jobDescription').value;
  const experience = document.getElementById('experience').value;
  
  // Update the output area
  document.getElementById('coverLetter').textContent = 'Generating...';
  document.getElementById('cv').textContent = 'Generating...';

  try {
    // Use your deployed Vercel URL when hosting separately
    const response = await fetch('https://cover-letter-and-cv-generator.vercel.app/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jobDescription, experience })
    });
    
    if (!response.ok) {
      throw new Error('Error generating cover letter and CV.');
    }
    
    const data = await response.json();
    document.getElementById('coverLetter').textContent = data.coverLetter;
    document.getElementById('cv').textContent = data.cv;
  } catch (error) {
    document.getElementById('coverLetter').textContent = error.message;
    document.getElementById('cv').textContent = error.message;
  }
});
