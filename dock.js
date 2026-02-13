/**
 * macOS-style Dock for page navigation
 * Inspired by reactbits.dev/components/dock - uses Motion for animations
 */
(async function() {
  const { animate } = await import('https://cdn.jsdelivr.net/npm/motion@11.15.0/+esm');

  const iconStyle = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const icons = {
    home: `<svg ${iconStyle}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    help: `<svg ${iconStyle}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    gallery: `<svg ${iconStyle}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
    team: `<svg ${iconStyle}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    star: `<svg ${iconStyle}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  };

  const pages = [
    { href: 'index.html', icon: 'home', label: 'Home' },
    { href: 'contact.html', icon: 'help', label: 'Get Help' },
    { href: 'photos.html', icon: 'gallery', label: 'Our Work' },
    { href: 'reviews.html', icon: 'star', label: 'Reviews' },
    { href: 'team.html', icon: 'team', label: 'Our Team' }
  ];

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const dock = document.createElement('div');
  dock.className = 'dock-wrap';
  dock.innerHTML = `
    <div class="dock" id="dock">
      ${pages.map(p => `
        <a href="${p.href}" class="dock-item ${p.href === currentPath ? 'active' : ''}" 
           data-magnify data-label="${p.label}" aria-label="${p.label}">
          <span class="dock-tooltip">${p.label}</span>
          <span class="dock-icon">${icons[p.icon]}</span>
        </a>
      `).join('')}
    </div>
  `;

  const slot = document.getElementById('dock-slot');
  if (slot) {
    slot.appendChild(dock.firstElementChild);
    slot.classList.add('dock-wrap');
  } else {
    dock.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:101;';
    document.body.insertBefore(dock, document.body.firstChild);
  }

  const items = document.querySelectorAll('.dock-item[data-magnify]');
  const MAGNIFY = 1.4;
  const SIBLING_SCALE = 1.15;

  items.forEach((item, i) => {
    item.addEventListener('mouseenter', () => {
      items.forEach((sib, j) => {
        const dist = Math.abs(i - j);
        let scale = 1;
        if (dist === 0) scale = MAGNIFY;
        else if (dist === 1) scale = SIBLING_SCALE;
        else if (dist === 2) scale = 1.05;
        animate(sib, { scale }, { duration: 0.25, easing: [0.32, 0.72, 0, 1] });
      });
    });

    item.addEventListener('mouseleave', () => {
      items.forEach(sib => {
        animate(sib, { scale: 1 }, { duration: 0.25, easing: [0.32, 0.72, 0, 1] });
      });
    });
  });
})();
