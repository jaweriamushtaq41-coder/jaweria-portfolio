document.documentElement.classList.remove('no-js');

// Theme toggle (light purple <-> dark), persisted where storage is available
(function initTheme() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  let saved = null;
  try { saved = localStorage.getItem('jm-theme'); } catch (e) { /* storage unavailable, ignore */ }

  if (saved === 'light' || saved === 'dark') {
    root.setAttribute('data-theme', saved);
  } else {
    root.setAttribute('data-theme', 'dark');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('jm-theme', next); } catch (e) { /* ignore */ }
    });
  }
})();

// Ripple click effect on buttons
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// Navbar shadow on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    navbar.style.borderBottomColor = 'rgba(62,142,247,0.35)';
  } else {
    navbar.style.borderBottomColor = '';
  }
});

// Typewriter rotating skill text
const typeEl = document.getElementById('typewriter');
const phrases = ['AI & ML Developer', 'MERN Stack Developer'];
let phraseIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  const current = phrases[phraseIndex];
  if (!deleting) {
    charIndex++;
    typeEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1400);
      return;
    }
  } else {
    charIndex--;
    typeEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }
  setTimeout(typeLoop, deleting ? 45 : 75);
}
if (typeEl) typeLoop();

// Subtle 3D tilt on hero photo (mouse move)
const photoWrap = document.querySelector('.hero-photo-wrap');
const photo = document.querySelector('.hero-photo');
if (photoWrap && photo) {
  photoWrap.addEventListener('mousemove', (e) => {
    const rect = photoWrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    photo.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  photoWrap.addEventListener('mouseleave', () => {
    photo.style.transform = '';
  });
}

// Contact form -> opens email client with prefilled message
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value;
    const email = document.getElementById('cf-email').value;
    const subject = document.getElementById('cf-subject').value;
    const message = document.getElementById('cf-message').value;
    const body = `Name: ${name}%0AEmail: ${email}%0A%0A${message}`;
    window.location.href = `mailto:jaweriamushtaq41@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
  });
}

// Project category filters
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('#projectsGrid .project-card');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('filtered-out', !match);
    });
  });
});

// Reveal on scroll
const revealEls = document.querySelectorAll(
  '.skill-card, .project-card, .tl-item, .info-card, .service-card, .internship-card, .certificate-card, .contact-row, .contact-form'
);
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});

// Staggered tool-card entrance animation
const toolCards = document.querySelectorAll('.tool-card');
const toolObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      toolObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

toolCards.forEach((card, i) => {
  card.style.animationDelay = (i % 7) * 0.06 + 's';
  toolObserver.observe(card);
});

/* ==========================================================================
   Portfolio Assistant — small rule-based chat widget
   100% client-side (no API key / backend needed), so it works out of the
   box on the same static Vercel deploy. Nothing above this block was
   touched. Answers are built from the real content already on this page.
   ========================================================================== */
(function initPortfolioAssistant() {
  const fab = document.getElementById('assistantFab');
  const panel = document.getElementById('assistantPanel');
  const closeBtn = document.getElementById('assistantClose');
  const messagesEl = document.getElementById('assistantMessages');
  const quickEl = document.getElementById('assistantQuick');
  const form = document.getElementById('assistantForm');
  const input = document.getElementById('assistantInput');

  if (!fab || !panel || !messagesEl || !form || !input) return;

  // --- Knowledge base, built from the real content on this page/CV ---
  const KB = [
    {
      id: 'greeting',
      keywords: ['hello', 'hi', 'hey', 'salam', 'assalam'],
      answer: "Hi there! I'm Jaweria's portfolio assistant 👋 Ask me about her skills, projects, internships, education, or how to get in touch."
    },
    {
      id: 'about',
      keywords: ['about', 'who is', 'who are', 'introduce', 'bio', 'background', 'tell me about her'],
      answer: "Jaweria Mushtaq is a Computer Science (BSCS) student at the University of Narowal, working at the intersection of AI/ML and MERN stack development. Her project work spans exoplanet detection with ML, database-driven monitoring systems, text-analysis tools, and Android apps. She also designed, built, and launched a real Shopify store from scratch."
    },
    {
      id: 'skills',
      keywords: ['skill', 'skills', 'tech stack', 'technologies', 'good at', 'expertise', 'proficient'],
      answer: "Her core skills:\n• AI & ML — Machine Learning, Data Structures & Algorithms, Parallel Computing\n• Web & Cloud — MERN Stack, Cloud Computing, SQL/MySQL\n• Programming — Python, Java, C++\n• E-commerce & Marketing — Shopify store building, SEO, Digital Marketing\n\nDay-to-day tools: VS Code, AWS, Node.js, PostgreSQL, Shopify, Git & GitHub, Figma, Vercel, Google Colab and more."
    },
    {
      id: 'projects',
      keywords: ['project', 'projects', 'work', 'portfolio', 'built', 'made', 'app'],
      answer: "Some featured projects:\n• Sakina Collection — a Shopify store built end-to-end\n• AI-Powered Exoplanet Detection (ML on Kepler data)\n• Magic Pet Detective — an image classifier\n• CrateFlow WMS & Amazon Warehouse WMS — warehouse management systems\n• PK Voyage — an Android travel app\n\nShe's built 19+ projects in total across AI/ML, web, cloud, mobile, and e-commerce. Scroll to the Projects section to filter by category!"
    },
    {
      id: 'internships',
      keywords: ['internship', 'internships', 'intern', 'experience', 'work experience'],
      answer: "Her internship experience:\n• MERN Stack Intern at UDevs — ongoing, building full-stack apps with React, Node.js, Express & MongoDB\n• Cloud Computing Intern at IT Simplera Solutions — completed (2-month program)\n• Generative AI Internship Intern at Internee.pk — completed (2-month virtual internship)"
    },
    {
      id: 'education',
      keywords: ['education', 'university', 'degree', 'bscs', 'study', 'studying', 'journey', 'college'],
      answer: "Jaweria is pursuing a BSCS at the University of Narowal (2023 – Present), covering Data Structures, Operating Systems, Computer Networks, Digital Logic Design, Compiler Construction, and Software Engineering — alongside real, shipped projects."
    },
    {
      id: 'certificates',
      keywords: ['certificate', 'certificates', 'certification', 'certifications', 'course', 'credential'],
      answer: "She holds 10+ certifications, including:\n• Generative AI Internship — Internee.pk\n• Cloud Computing Internship — IT Simplera Solutions\n• Foundations of UX Design — Google (Coursera)\n• Foundations of Data Science — Google (Coursera)\n• AI for App Building — Google (Coursera)\n• AI for Research and Insights — Google (Coursera)\n• Digital Marketing & E-commerce — Google (Coursera)\n\n...plus Microsoft Office, Digital Marketing, and E-commerce Development. Click any certificate in the Certificates section to view and download it!"
    },
    {
      id: 'services',
      keywords: ['service', 'services', 'offer', 'help with', 'hire', 'freelance'],
      answer: "She offers: Meta Ads & Digital Marketing, E-commerce & Shopify Setup, MERN Stack Development, Mobile App Development, AI & Machine Learning, Full-Stack Development, Frontend Development, and Backend Development. She's currently open to internships and freelance work!"
    },
    {
      id: 'contact',
      keywords: ['contact', 'email', 'reach', 'linkedin', 'github', 'get in touch', 'hire her', 'phone'],
      answer: "You can reach Jaweria at jaweriamushtaq41@gmail.com, or find her on LinkedIn (jaweria-mushtaq) and GitHub (jaweriamushtaq41-coder). She's based in Narowal, Punjab, Pakistan. There's also a contact form at the bottom of this page!"
    },
    {
      id: 'cv',
      keywords: ['cv', 'resume', 'download'],
      answer: "You can download her CV using the \"Download CV\" button in the hero section at the top of the page."
    },
    {
      id: 'location',
      keywords: ['location', 'based', 'where', 'live', 'city', 'country'],
      answer: "Jaweria is based in Narowal, Punjab, Pakistan."
    },
    {
      id: 'thanks',
      keywords: ['thanks', 'thank you', 'shukriya', 'ok', 'great', 'nice'],
      answer: "You're welcome! Feel free to ask anything else about Jaweria's work, or reach out through the Contact section. 🙂"
    }
  ];

  const FALLBACK = "I'm not sure about that one — but you can ask about her skills, projects, internships, education, certificates, or how to contact her. For anything specific, email jaweriamushtaq41@gmail.com and she'll get back to you.";

  function findAnswer(text) {
    const q = text.toLowerCase();
    let best = null;
    let bestScore = 0;
    KB.forEach(entry => {
      let score = 0;
      entry.keywords.forEach(k => {
        if (q.includes(k)) score += k.split(' ').length; // reward longer/more specific matches
      });
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });
    return best ? best.answer : FALLBACK;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(text, role) {
    const bubble = document.createElement('div');
    bubble.className = `assistant-msg ${role}`;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    scrollToBottom();
    return bubble;
  }

  function showTypingThenReply(question) {
    const typing = document.createElement('div');
    typing.className = 'assistant-msg bot typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    scrollToBottom();

    const delay = 450 + Math.min(500, question.length * 8);
    setTimeout(() => {
      typing.remove();
      addMessage(findAnswer(question), 'bot');
    }, delay);
  }

  function handleUserQuestion(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    addMessage(trimmed, 'user');
    showTypingThenReply(trimmed);
  }

  let started = false;
  function openPanel() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    fab.classList.add('open');
    fab.setAttribute('aria-expanded', 'true');
    if (!started) {
      started = true;
      addMessage("Hi! I'm Jaweria's portfolio assistant. Ask me anything about her skills, projects, internships, or how to get in touch.", 'bot');
    }
    setTimeout(() => input.focus(), 150);
  }

  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    fab.classList.remove('open');
    fab.setAttribute('aria-expanded', 'false');
  }

  function togglePanel() {
    if (panel.classList.contains('open')) closePanel();
    else openPanel();
  }

  fab.addEventListener('click', togglePanel);
  fab.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePanel();
    }
  });
  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });

  if (quickEl) {
    quickEl.querySelectorAll('.assistant-chip').forEach(chip => {
      chip.addEventListener('click', () => handleUserQuestion(chip.dataset.q || chip.textContent));
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value;
    input.value = '';
    handleUserQuestion(value);
  });
})();

/* ==========================================================================
   Certificate lightbox — click a certificate card to view it full-size,
   with a download button. Nothing above this block was touched.
   ========================================================================== */
(function initCertLightbox() {
  const cards = document.querySelectorAll('.cert-gallery-card');
  const lightbox = document.getElementById('certLightbox');
  if (!cards.length || !lightbox) return;

  const backdrop = document.getElementById('certLightboxBackdrop');
  const closeBtn = document.getElementById('certLightboxClose');
  const imgEl = document.getElementById('certLightboxImg');
  const metaEl = document.getElementById('certLightboxMeta');
  const titleEl = document.getElementById('certLightboxTitle');
  const descEl = document.getElementById('certLightboxDesc');
  const verifyEl = document.getElementById('certLightboxVerify');
  const downloadEl = document.getElementById('certLightboxDownload');

  let lastFocused = null;

  function openFromCard(card) {
    const { img, title, issuer, date, desc, verify, download } = card.dataset;
    imgEl.src = img;
    imgEl.alt = title || 'Certificate';
    titleEl.textContent = title || '';
    metaEl.textContent = [issuer, date].filter(Boolean).join(' · ').toUpperCase();
    descEl.textContent = desc || '';
    if (verify) {
      verifyEl.href = verify;
      verifyEl.style.display = 'inline-block';
    } else {
      verifyEl.style.display = 'none';
    }
    downloadEl.href = img;
    downloadEl.setAttribute('download', download || 'certificate.jpg');

    lastFocused = document.activeElement;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtn.focus(), 50);
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  cards.forEach(card => {
    card.addEventListener('click', () => openFromCard(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFromCard(card);
      }
    });
  });

  if (backdrop) backdrop.addEventListener('click', closeLightbox);
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
})();
