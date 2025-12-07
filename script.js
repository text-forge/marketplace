const baseRepo = 'text-forge/mp';
const branch = 'main';
const basePath = `https://raw.githubusercontent.com/${baseRepo}/${branch}/packages`;
const container = document.getElementById('packages');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

let allPackages = [];

async function fetchPackages() {
  try {
    const res = await fetch(`${basePath}/../packages.json`);
    const packages = await res.json();

    const packagePromises = packages.map(async (pkg) => {
      const packJsonUrl = `${basePath}/${pkg.id}/pack.json`;
      let fileName = null;

      try {
        const packRes = await fetch(packJsonUrl);
        const packData = await packRes.json();
        fileName = packData.file;
      } catch (err) {
        console.warn(`Missing or invalid pack.json for ${pkg.id}`);
      }

      const githubUrl = `https://github.com/${baseRepo}/tree/${branch}/packages/${pkg.id}`;
      const downloadUrl = fileName
        ? `${basePath}/${pkg.id}/${fileName}`
        : null;

      return { ...pkg, githubUrl, downloadUrl, fileName };
    });

    allPackages = await Promise.all(packagePromises);
    
    loadingEl.style.display = 'none';
    renderPackages(allPackages);
    setupFilters();
    
  } catch (error) {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
    console.error('Error loading packages:', error);
  }
}

function renderPackages(packages) {
  container.innerHTML = '';
  
  packages.forEach((pkg, index) => {
    const card = createPackageCard(pkg);
    card.style.animationDelay = `${index * 50}ms`;
    container.appendChild(card);
  });
}

function createPackageCard(pkg) {
  const card = document.createElement('div');
  card.className = 'package-card';
  card.setAttribute('data-category', pkg.category);
  
  const tags = pkg.tags.map(tag => {
    const isOfficial = tag.toLowerCase() === 'official';
    return `<span class="tag${isOfficial ? ' official' : ''}">${tag}</span>`;
  }).join('');

  let fileActionLabel = 'Download';
  let fileActionIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>`;
  
  if (pkg.fileName && pkg.fileName.endsWith('.tres')) {
    fileActionLabel = 'View Theme';
    fileActionIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`;
  }

  card.innerHTML = `
    <div class="package-header">
      <h3 class="package-title">${pkg.name}</h3>
      <span class="package-version">v${pkg.version}</span>
    </div>
    <p class="package-description">${pkg.description}</p>
    <div class="package-meta">
      <div class="package-meta-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>${pkg.category}</span>
      </div>
      <div class="package-meta-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>${pkg.author}</span>
      </div>
    </div>
    <div class="package-tags">${tags}</div>
    <div class="package-actions">
      ${pkg.downloadUrl && pkg.fileName 
        ? `<a href="${pkg.downloadUrl}" target="_blank" class="btn btn-primary">${fileActionIcon}${fileActionLabel}</a>` 
        : `<span class="btn btn-secondary" style="opacity: 0.5; cursor: default;">No file available</span>`}
      <a href="${pkg.githubUrl}" target="_blank" class="btn btn-secondary">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        View Source
      </a>
    </div>
  `;

  return card;
}

function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      filterPackages(filter);
    });
  });
}

function filterPackages(category) {
  if (category === 'all') {
    renderPackages(allPackages);
  } else {
    const filtered = allPackages.filter(pkg => pkg.category === category);
    renderPackages(filtered);
  }
}

document.querySelector('.nav-toggle').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('active');
  });
});

fetchPackages();
