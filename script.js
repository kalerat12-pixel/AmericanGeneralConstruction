// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
const headerCta = document.querySelector('.header-cta');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  headerCta.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile nav after clicking a link
mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    headerCta.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Sticky header shadow on scroll
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,0.25)' : 'none';
});

// Quote form — submits to the /api/quote serverless function
const quoteForm = document.getElementById('quoteForm');
const formNote = document.getElementById('formNote');
const submitBtn = quoteForm.querySelector('button[type="submit"]');

quoteForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!quoteForm.checkValidity()) {
    formNote.textContent = 'Please fill in the required fields above.';
    formNote.classList.remove('success');
    return;
  }

  const payload = Object.fromEntries(new FormData(quoteForm).entries());

  submitBtn.disabled = true;
  formNote.textContent = 'Sending...';
  formNote.classList.remove('success');

  try {
    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Request failed');

    formNote.textContent = "Thanks! We'll be in touch shortly to discuss your project.";
    formNote.classList.add('success');
    quoteForm.reset();
  } catch (err) {
    formNote.textContent = 'Something went wrong — please call us directly at (260) 223-0548.';
    formNote.classList.remove('success');
  } finally {
    submitBtn.disabled = false;
  }
});
