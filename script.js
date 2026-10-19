const header = document.querySelector('#site-header');
const navToggle = document.querySelector('.nav-toggle');
const primaryNav = document.querySelector('#primary-navigation');
const heroSection = document.querySelector('#home');
const setHeroVisibility = (isVisible) => document.body.classList.toggle('hero-in-view', isVisible);

const heroBounds = heroSection.getBoundingClientRect();
setHeroVisibility(heroBounds.bottom > 0 && heroBounds.top < window.innerHeight);

if ('IntersectionObserver' in window) {
  const heroObserver = new IntersectionObserver(([entry]) => {
    setHeroVisibility(entry.isIntersecting);
  }, { threshold: 0.02 });
  heroObserver.observe(heroSection);
} else {
  window.addEventListener('scroll', () => {
    const bounds = heroSection.getBoundingClientRect();
    setHeroVisibility(bounds.bottom > 0 && bounds.top < window.innerHeight);
  }, { passive: true });
}

const closeNavigation = () => {
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open navigation');
  primaryNav.classList.remove('is-open');
  document.body.classList.remove('nav-open');
};

navToggle.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  primaryNav.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('nav-open', !isOpen);
});

primaryNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNavigation));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
    closeNavigation();
    navToggle.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 860) closeNavigation();
});

const updateHeader = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 12);
};
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const sectionLinks = [...primaryNav.querySelectorAll('a[href^="#"]')];
const linkedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && linkedSections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visibleSection = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visibleSection) return;

    sectionLinks.forEach((link) => {
      const isCurrent = link.getAttribute('href') === `#${visibleSection.target.id}`;
      if (isCurrent) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-30% 0px -55%', threshold: [0, .25, .5] });
  linkedSections.forEach((section) => sectionObserver.observe(section));
}

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.querySelectorAll('.accordion__item button').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.accordion__item');
    const willOpen = !item.classList.contains('is-open');
    document.querySelectorAll('.accordion__item').forEach((entry) => {
      entry.classList.remove('is-open');
      entry.querySelector('button').setAttribute('aria-expanded', 'false');
      entry.querySelector('.accordion__panel').setAttribute('aria-hidden', 'true');
    });
    if (willOpen) {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      item.querySelector('.accordion__panel').setAttribute('aria-hidden', 'false');
    }
  });
});

const galleryFilters = document.querySelectorAll('[data-gallery-filter]');
const galleryItems = document.querySelectorAll('[data-gallery-category]');
const galleryCount = document.querySelector('#gallery-count');
const galleryMore = document.querySelector('#gallery-more');
const mobileGallery = window.matchMedia('(max-width: 640px)');
let selectedGalleryCategory = 'all';
let galleryExpanded = false;

const updateGallery = () => {
  const matchingItems = [...galleryItems].filter((item) => (
    selectedGalleryCategory === 'all' || item.dataset.galleryCategory === selectedGalleryCategory
  ));
  const shouldLimit = mobileGallery.matches && selectedGalleryCategory === 'all' && !galleryExpanded;

  galleryItems.forEach((item) => {
    const matchingIndex = matchingItems.indexOf(item);
    const shouldShow = matchingIndex !== -1 && (!shouldLimit || matchingIndex < 8);
    item.hidden = !shouldShow;
  });

  document.querySelector('.gallery-wall').classList.toggle('is-filtered', selectedGalleryCategory !== 'all');
  galleryCount.textContent = matchingItems.length;
  galleryMore.textContent = `Show all ${matchingItems.length} photos`;
  galleryMore.hidden = !(shouldLimit && matchingItems.length > 8);
};

galleryFilters.forEach((button) => {
  button.addEventListener('click', () => {
    selectedGalleryCategory = button.dataset.galleryFilter;
    galleryExpanded = false;

    galleryFilters.forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle('is-active', isSelected);
      filterButton.setAttribute('aria-pressed', String(isSelected));
    });

    updateGallery();
  });
});

galleryMore.addEventListener('click', () => {
  const firstNewItem = [...galleryItems].find((item) => item.hidden);
  galleryExpanded = true;
  updateGallery();
  firstNewItem?.focus({ preventScroll: true });
  firstNewItem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

mobileGallery.addEventListener('change', updateGallery);
updateGallery();

const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxClose = lightbox.querySelector('.lightbox__close');
let lightboxTrigger = null;

document.querySelectorAll('[data-lightbox]').forEach((button) => {
  button.addEventListener('click', () => {
    lightboxTrigger = button;
    lightboxImage.src = button.dataset.lightbox;
    lightboxImage.alt = button.querySelector('img').alt;
    lightbox.showModal();
  });
});

lightboxClose.addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener('close', () => {
  lightboxImage.removeAttribute('src');
  lightboxImage.alt = '';
  lightboxTrigger?.focus();
});

document.querySelector('#year').textContent = new Date().getFullYear();
