const subpages = [
    { name: "Home", url: "/Home.html", desc: "The home of the website!" },
    { name: "Links", url: "/Links.html", desc: "Links to my other accounts!" },
    { name: "Site Info", url: "/SiteInfo.html", desc: "Information about this site!" },
    { name: "Trombone Champ Charts", url: "/TromboneChamp.html", desc: "My Trombone Champ Charts!" },
    { name: "Character List", url: "/Characters/List.html", desc: "A list of my characters!" },
    { name: "Ether", url: "/Characters/Ether/Info.html", desc: "Ether's page!" },
    { name: "Net", url: "/Characters/Net/Info.html", desc: "Net's page!" },
    { name: "Eclipse", url: "/Characters/Eclipse/Info.html", desc: "Eclipse's page!" },
    { name: "Esther", url: "/Characters/Esther/Info.html", desc: "Ether's page!" },
    { name: "Cyn", url: "/Characters/Cyn/Info.html", desc: "Ether's page!" },
    { name: "Rafisol [Internet Wizard]", url: "/Characters/Rafisol_IW/Info.html", desc: "Rafisol, the internet wizard's page!" },
    { name: "Settings", url: "/Settings.html", desc: "Change your site settings!" },
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