// Builds Bootstrap card grids from a JSON entries file.
// Entry shape: { title, img, desc, links: [{ text, class, url }] }
// links[].url is the real target — gets wrapped in Redirect.html automatically.

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function buildEntryCard(entry) {
    const linksHtml = (entry.links || []).map(link =>
        `<a href="./Redirect.html?redirect=${encodeURIComponent(link.url)}" class="btn ${link.class}" target="_blank">${escapeHtml(link.text)}</a>`
    ).join('\n');

    return `
        <div class="col-md-4 pb-1 pb-md-0">
            <div class="card">
                <img class="card-img-top" src="${entry.img}" alt="${escapeHtml(entry.title)}">
                <div class="card-body">
                    <h5 class="card-title">${escapeHtml(entry.title)}</h5>
                    <p class="card-text">${entry.desc || ''}</p>
                    ${linksHtml}
                </div>
            </div>
        </div>`;
}

async function renderEntries(containerId, jsonPath, emptyMessageHtml) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let entries = [];
    try {
        const res = await fetch(jsonPath);
        entries = await res.json();
    } catch (err) {
        console.error(`renderEntries: failed to load ${jsonPath}`, err);
    }

    if (!entries.length) {
        container.innerHTML = emptyMessageHtml || '<div class="col-12 text-center"><p>No entries yet.</p></div>';
        return;
    }

    const rows = [];
    for (let i = 0; i < entries.length; i += 3) {
        const rowEntries = entries.slice(i, i + 3);
        const rowClass = i === 0 ? 'row text-center' : 'row text-center mt-4';
        rows.push(`<div class="${rowClass}">${rowEntries.map(buildEntryCard).join('\n')}</div>`);
    }
    container.innerHTML = rows.join('\n');
}
