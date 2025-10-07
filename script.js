const baseRepo = 'text-forge/mp';
const branch = 'main';
const basePath = `https://raw.githubusercontent.com/${baseRepo}/${branch}/packages`;
const container = document.getElementById('packages');

async function fetchPackages() {
  try {
    const res = await fetch(`${basePath}/../packages.json`);
    const packages = await res.json();

    for (const pkg of packages) {
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

      renderCard(pkg, githubUrl, downloadUrl);
    }
  } catch (error) {
    container.innerHTML = `<p>Failed to load packages. Please try again later.</p>`;
    console.error('Error loading packages:', error);
  }
}

function renderCard(pkg, githubUrl, downloadUrl, fileName) {
  const card = document.createElement('div');
  card.className = 'card';

  const tags = pkg.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ');

  // Determine button label based on file extension
  let fileActionLabel = 'Download Package';
  if (fileName && fileName.endsWith('.tres')) {
    fileActionLabel = 'View Theme File';
  }

  card.innerHTML = `
    <h2>${pkg.name}</h2>
    <p>${pkg.description}</p>
    <p><strong>Version:</strong> ${pkg.version}</p>
    <p><strong>Category:</strong> ${pkg.category}</p>
    <p><strong>Author:</strong> ${pkg.author}</p>
    <p><strong>Tags:</strong> ${tags}</p>
    <a href="${githubUrl}" target="_blank">View on GitHub</a>
    ${downloadUrl && fileName ? `<a href="${downloadUrl}" target="_blank">${fileActionLabel}</a>` : `<p><em>No downloadable file found</em></p>`}
  `;

  container.appendChild(card);
}


fetchPackages();
