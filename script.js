const repo = 'text-forge/mp';
const branch = 'main';
const container = document.getElementById('packages');

async function fetchPackages() {
  const apiUrl = `https://api.github.com/repos/${repo}/contents`;
  const res = await fetch(apiUrl);
  const files = await res.json();

  const jsonFiles = files.filter(f => f.name.endsWith('.forge.json'));

  for (const file of jsonFiles) {
    const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${file.name}`;
    const res = await fetch(rawUrl);
    const data = await res.json();
    renderCard(data, rawUrl);
  }
}

function renderCard(pkg, rawUrl) {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2>${pkg.name}</h2>
    <p>${pkg.description || 'بدون توضیح'}</p>
    <a href="${rawUrl}" target="_blank">دانلود</a>
  `;

  container.appendChild(card);
}

fetchPackages();
