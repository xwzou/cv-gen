document.getElementById('inputForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Get form values
  const jobDescription = document.getElementById('jobDescription').value;
  const experience = document.getElementById('experience').value;
  
  // Reference the output elements
  const coverLetterElement = document.getElementById('coverLetter');
  const cvElement = document.getElementById('cv');
  
  // Show loading messages
  coverLetterElement.textContent = 'Generating cover letter...';
  cvElement.textContent = 'Generating CV...';
  
  try {
    // Make the POST request to your API endpoint
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
    
    // Parse the JSON response
    const data = await response.json();
    
    // Update the output elements with the generated data
    coverLetterElement.textContent = data.coverLetter;
    cvElement.textContent = data.cv;
  } catch (error) {
    console.error('Error:', error);
    coverLetterElement.textContent = 'Error generating cover letter and CV.';
    cvElement.textContent = 'Error generating cover letter and CV.';
  }
});
