document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const body = document.body;

  if (mobileToggle && mobileMenu) {
    const bars = mobileToggle.querySelectorAll('.bar');
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      
      if (mobileToggle.classList.contains('open')) {
        bars[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
      } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      }
    });

    // Close menu when a link is clicked
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      });
    });
  }

  // 2. Active Link Highlighting on Scroll (Intersection Observer)
  const sections = document.querySelectorAll('section[id], #contact');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-30% 0px -60% 0px'
  });

  sections.forEach(section => scrollObserver.observe(section));

  // 3. Callback Consultation Form Submission Simulator
  const form = document.getElementById('consultationForm');
  const successNotification = document.getElementById('successNotification');

  if (form && successNotification) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;

      setTimeout(() => {
        form.style.opacity = '0';
        
        setTimeout(() => {
          form.style.display = 'none';
          successNotification.classList.add('show');
          successNotification.style.opacity = '0';
          successNotification.style.display = 'flex';
          
          successNotification.offsetHeight; 
          successNotification.style.transition = 'opacity 0.5s ease';
          successNotification.style.opacity = '1';
        }, 300);

      }, 1200);
    });
  }

  // 4. Set Default Date to Today + 1 Day for booking
  const dateInput = document.getElementById('bookingDate');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  // 5. Dynamic CMS Content Loader (Decap CMS)
  const loadCmsData = async () => {
    try {
      // Fetch Clinic Settings
      const settingsResponse = await fetch('data/settings.json');
      const settings = await settingsResponse.json();
      
      // Populate Settings
      const primaryPhoneLink = document.getElementById('primaryPhoneLink');
      const primaryPhoneText = document.getElementById('primaryPhoneText');
      const emailLink = document.getElementById('emailLink');
      const emailText = document.getElementById('emailText');
      const clinicAddressText = document.getElementById('clinicAddressText');
      const clinicMapIframe = document.getElementById('clinicMapIframe');
      const operatingHoursText = document.getElementById('operatingHoursText');
      
      if (primaryPhoneLink) primaryPhoneLink.href = `tel:${settings.phone.replace(/\s+/g, '')}`;
      if (primaryPhoneText) primaryPhoneText.textContent = settings.phone;
      if (emailLink) emailLink.href = `mailto:${settings.email}`;
      if (emailText) emailText.textContent = settings.email;
      if (clinicAddressText) clinicAddressText.textContent = settings.address;
      if (clinicMapIframe) clinicMapIframe.src = settings.map_url;
      if (operatingHoursText) {
        const formatTime = (h) => {
          const ampm = h >= 12 ? 'PM' : 'AM';
          const displayHour = h % 12 || 12;
          return `${String(displayHour).padStart(2, '0')}:00 ${ampm}`;
        };
        operatingHoursText.textContent = `${formatTime(settings.open_hour)} - ${formatTime(settings.close_hour)}`;
      }
      
      // Update Operating Hours status checking variables
      const openHour = settings.open_hour || 10;
      const closeHour = settings.close_hour || 18;
      
      // Live Clinic Open/Closed Indicator
      const liveStatusBadge = document.getElementById('liveStatus');
      if (liveStatusBadge) {
        const updateClinicStatus = () => {
          const now = new Date();
          const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
          const istTime = new Date(utc + (3600000 * 5.5)); // IST timezone
          
          const day = istTime.getDay();
          const hours = istTime.getHours();
          const minutes = istTime.getMinutes();
          const statusText = liveStatusBadge.querySelector('.status-text');
          
          let isOpen = false;
          if (day !== 0) { // Mon-Sat
            if (hours > openHour && hours < closeHour) {
              isOpen = true;
            } else if (hours === openHour && minutes >= 0) {
              isOpen = true;
            } else if (hours === closeHour && minutes === 0) {
              isOpen = true;
            }
          }
          
          if (isOpen) {
            liveStatusBadge.className = 'live-status-badge open';
            statusText.textContent = 'Open Now';
          } else {
            liveStatusBadge.className = 'live-status-badge closed';
            if (day === 0) {
              statusText.textContent = 'Closed (Opens Mon)';
            } else if (hours < openHour) {
              statusText.textContent = 'Closed (Opens 10 AM)';
            } else {
              statusText.textContent = 'Closed Now';
            }
          }
        };
        updateClinicStatus();
        setInterval(updateClinicStatus, 30000);
      }
      
    } catch (err) {
      console.error('Error loading clinic settings:', err);
    }

    try {
      // Fetch Patient Education Articles
      const articlesResponse = await fetch('data/articles.json');
      const articles = await articlesResponse.json();
      const educationGrid = document.getElementById('educationGrid');
      
      if (educationGrid && articles && articles.length > 0) {
        educationGrid.innerHTML = ''; // Clear loading placeholder
        
        articles.forEach(article => {
          const card = document.createElement('div');
          card.className = 'article-card';
          card.setAttribute('data-article', article.id);
          card.innerHTML = `
            <div class="article-image">
              <img src="${article.thumbnail}" alt="${article.title}" loading="lazy">
            </div>
            <div class="article-body">
              <span class="article-tag">${article.category}</span>
              <h3 class="article-title">${article.title}</h3>
              <p class="article-excerpt">${article.excerpt}</p>
              <button class="btn btn-outline btn-full btn-read-article">Read Article</button>
            </div>
          `;
          educationGrid.appendChild(card);
        });
        
        // Setup Modal Handlers for the dynamically loaded articles
        setupArticleModal(articles);
      }
    } catch (err) {
      console.error('Error loading articles:', err);
    }
  };

  // Helper function to handle Article Modal initialization
  const setupArticleModal = (articles) => {
    const modal = document.getElementById('articleModal');
    const modalBody = document.getElementById('modalArticleBody');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const body = document.body;

    if (modal && modalBody && closeModalBtn) {
      const articleButtons = document.querySelectorAll('.btn-read-article');
      articleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const card = e.target.closest('.article-card');
          const articleId = card.getAttribute('data-article');
          const article = articles.find(a => a.id === articleId);

          if (article) {
            modalBody.innerHTML = `
              <span class="article-tag">${article.category}</span>
              <h2>${article.title}</h2>
              <div class="article-meta">
                <span>${article.date || 'Published'}</span>
                <span>&bull;</span>
                <span>By Dr. Manish Bansal</span>
              </div>
              <div class="article-full-text">
                ${article.content}
              </div>
            `;
            modal.style.display = 'flex';
            body.style.overflow = 'hidden';
            modal.offsetHeight;
            modal.classList.add('show');
          }
        });
      });

      const closeModal = () => {
        modal.classList.remove('show');
        body.style.overflow = '';
        setTimeout(() => {
          modal.style.display = 'none';
          modalBody.innerHTML = '';
        }, 300);
      };

      closeModalBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
      });
    }
  };

  // Trigger CMS Data Loading
  loadCmsData();
});
