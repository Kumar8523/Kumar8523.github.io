 //  Google Apps Script URL
 const scriptURL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

 // Mobile Menu Toggle & Active Link & Cart Count moved into navber_footer.js

 // Contact Form Submission
 const contactForm = document.getElementById('contactForm');
 const formStatus = document.getElementById('formStatus');
 contactForm.addEventListener('submit', async (e) => {
   e.preventDefault();
   const data = {
     fullName: document.getElementById('fullName').value.trim(),
     email: document.getElementById('email').value.trim(),
     phone: document.getElementById('phone').value.trim(),
     subject: document.getElementById('subject').value.trim(),
     message: document.getElementById('message').value.trim(),
     timestamp: new Date().toISOString()
   };
   try {
     const response = await fetch(scriptURL, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data)
     });
     if (response.ok) {
       formStatus.textContent = 'Message sent successfully!';
       formStatus.classList.remove('text-red-600');
       formStatus.classList.add('text-green-600');
       contactForm.reset();
     } else {
       formStatus.textContent = 'Failed to send message. Please try again later.';
       formStatus.classList.remove('text-green-600');
       formStatus.classList.add('text-red-600');
     }
   } catch (error) {
     console.error('Error:', error);
     formStatus.textContent = 'An error occurred. Please try again later.';
     formStatus.classList.remove('text-green-600');
     formStatus.classList.add('text-red-600');
   }
 });
