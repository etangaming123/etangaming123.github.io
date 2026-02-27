const subpages = [
    { name: "Home", url: "./index.html", desc: "The home of the website!" },
    { name: "Links", url: "./Links.html", desc: "Links to my other accounts!" },
    { name: "Trombone Champ Charts", url: "./TromboneChamp.html", desc: "My Trombone Champ Charts!" },
    { name: "maimai", url: "./maimai.html", desc: "My maimai stats!" },
    { name: "maisquared", url: "./maisquared.html", desc: "Custom maisquared charts!" },
    { name: "Message", url: "./Message.html", desc: "A resource for me to send messages to others." },
];

    function handleSearch(event) {
        event.preventDefault();
        const query = document.getElementById('searchInput').value.toLowerCase();
        const results = subpages.filter(page => page.name.toLowerCase().includes(query));
        const resultsDiv = document.getElementById('searchResults');
        resultsDiv.innerHTML = '';
        if (results.length > 0 && query) {
            resultsDiv.innerHTML = '<div class="dropdown-item disabled">Pages found:</div>';
            results.forEach(page => {
                const a = document.createElement('a');
                a.className = 'dropdown-item';
                a.href = page.url;
                a.innerHTML = `<span style="display:block;">${page.name}</span><small style="display:block; font-size: 0.85em; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${page.desc}</small>`;
                resultsDiv.appendChild(a);
            });
            resultsDiv.style.display = 'block';
        } else {
            resultsDiv.innerHTML = '<div class="dropdown-item disabled">No results found :(</div>';
            resultsDiv.style.display = 'block';
        }
        return false;
    }

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