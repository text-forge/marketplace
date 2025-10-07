const rawUrl = 'https://raw.githubusercontent.com/text-forge/mp/main/packages.json';
const container = document.getElementById('packages');

async function fetchPackages() {
  try {
    const res = await fetch(rawUrl);
    const packages = await res.json();

    packages.forEach(pkg => {
      const githubUrl = `https://github.com/text-forge/mp/tree/main/packages/${pkg.id}`;
      renderCard(pkg, githubUrl);
    });
  } catch (error) {
    container.innerHTML = `<p>Failed to load packages. Please try again later.</p>`;
    console.error('Error loading packages:', error);
  }
}

function renderCard(pkg, url) {
  const card = document.createElement('div');
  card.className = 'card';

  const tags = pkg.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ');

  card.innerHTML = `
    <h2>${pkg.name}</h2>
    <p>${pkg.description}</p>
    <p><strong>Version:</strong> ${pkg.version}</p>
    <p><strong>Category:</strong> ${pkg.category}</p>
    <p><strong>Author:</strong> ${pkg.author}</p>
    <p><strong>Tags:</strong> ${tags}</p>
    <a href="${url}" target="_blank">View on GitHub</a>
  `;

  container.appendChild(card);
}

fetchPackages();
