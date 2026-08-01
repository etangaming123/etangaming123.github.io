// real pages only (excludes redirect stubs like Home.html/Redirect.html/TromboneChamp/*)
const searchablePages = [
    "./index.html",
    "./Ethics.html",
    "./Friends.html",
    "./Links.html",
    "./Message.html",
    "./TromboneChamp.html",
    "./maimai.html",
    "./maisquared.html",
];

// pages whose entry cards are rendered client-side by renderEntries.js from JSON
// (not present in the raw HTML fetched below) — index the JSON directly too
const pageEntrySources = {
    "./TromboneChamp.html": "./js/data/tromboneEntries.json",
    "./maisquared.html": "./js/data/maisquaredEntries.json",
};

async function fetchEntriesText(jsonPath) {
    try {
        const res = await fetch(jsonPath);
        const entries = await res.json();
        return entries.map(e => `${e.title} ${(e.desc || '').replace(/<[^>]+>/g, ' ')}`).join(' ');
    } catch (err) {
        return '';
    }
}

let searchIndexPromise = null;

async function buildSearchIndex() {
    const pages = await Promise.all(searchablePages.map(async (url) => {
        try {
            const res = await fetch(url);
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            // #rando and #visitingfrom hold static placeholder text that JS overwrites at runtime
            // (rando.js/visitingfrom.js never ran here since we only fetched+parsed the HTML) — skip them
            doc.querySelectorAll('script, style, nav, footer, #rando, #visitingfrom').forEach(el => el.remove());
            const rawTitle = doc.querySelector('title')?.textContent || url;
            const name = rawTitle.replace(/^etan:\/\//, '').trim() || (url === './index.html' ? 'Home' : url);
            const desc = doc.querySelector('meta[name="description"]')?.content || '';
            let text = doc.body ? doc.body.textContent.replace(/\s+/g, ' ').trim() : '';
            const entrySource = pageEntrySources[url];
            if (entrySource) {
                const entriesText = await fetchEntriesText(entrySource);
                text = `${text} ${entriesText}`.trim();
            }
            return { name, url, desc, text };
        } catch (err) {
            return null;
        }
    }));
    return pages.filter(Boolean);
}

function getSearchIndex() {
    if (!searchIndexPromise) searchIndexPromise = buildSearchIndex();
    return searchIndexPromise;
}

function snippetAround(text, query) {
    const i = text.toLowerCase().indexOf(query);
    if (i === -1) return '';
    const start = Math.max(0, i - 40);
    const end = Math.min(text.length, i + query.length + 60);
    return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

async function handleSearch(event) {
    event.preventDefault();
    const input = document.getElementById('searchInput');
    const query = input.value.toLowerCase().trim();
    const resultsDiv = document.getElementById('searchResults');

    if (!query) {
        resultsDiv.innerHTML = '';
        resultsDiv.style.display = 'none';
        return false;
    }

    const index = await getSearchIndex();

    // bail if user kept typing while pages were fetching
    if (input.value.toLowerCase().trim() !== query) return false;

    const results = index.map(page => {
        const nameHit = page.name.toLowerCase().includes(query);
        const descHit = page.desc.toLowerCase().includes(query);
        const textHit = page.text.toLowerCase().includes(query);
        if (!nameHit && !descHit && !textHit) return null;
        const rank = nameHit ? 0 : descHit ? 1 : 2;
        const match = descHit || nameHit ? page.desc : snippetAround(page.text, query);
        return { page, rank, match };
    }).filter(Boolean).sort((a, b) => a.rank - b.rank);

    resultsDiv.innerHTML = '';
    if (results.length > 0) {
        resultsDiv.innerHTML = '<div class="dropdown-item disabled">Pages found:</div>';
        results.forEach(({ page, match }) => {
            const a = document.createElement('a');
            a.className = 'dropdown-item';
            a.href = page.url;
            const title = document.createElement('span');
            title.style.display = 'block';
            title.textContent = page.name;
            const small = document.createElement('small');
            small.style.cssText = 'display:block; font-size: 0.85em; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
            small.textContent = match;
            a.appendChild(title);
            a.appendChild(small);
            resultsDiv.appendChild(a);
        });
        resultsDiv.style.display = 'block';
    } else {
        resultsDiv.innerHTML = '<div class="dropdown-item disabled">No results found :(</div>';
        resultsDiv.style.display = 'block';
    }
    return false;
}

// warm index early so first keystroke doesn't wait on fetches
document.addEventListener('DOMContentLoaded', function() {
    getSearchIndex();
});

    // Hide results when clicking outside
    document.addEventListener('click', function(e) {
    if (!document.getElementById('searchForm').contains(e.target)) {
        document.getElementById('searchResults').style.display = 'none';
    }
    });

    // Show results as user types
    document.getElementById('searchInput').addEventListener('input', function() {
    handleSearch(new Event('submit'));
});

// might as well add this too cuz this script is linked in every page
const etherpfp = document.getElementById("etherLogo");
document.addEventListener("DOMContentLoaded", function() {
    const defaultPfp = localStorage.getItem("defaultPfp");
    values = {"default": "./images/characters/ether.png", "ollama": "./images/otherpfps/llamaburger.png", "rafisol": "./images/otherpfps/rafisol_quest.png", "rafisol_steam": "./images/otherpfps/rafisol_steam.png"};
    if (defaultPfp) {
        etherpfp.src = defaultPfp;
    }
});