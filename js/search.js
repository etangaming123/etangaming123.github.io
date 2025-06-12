const subpages = [
    { name: "Home", url: "/Home.html", desc: "The home of the website" },
    { name: "About", url: "/About.html", desc: "More about me" },
    { name: "Links", url: "/Links.html", desc: "Links to my other accounts" },
    { name: "Site Info", url: "/SiteInfo.html", desc: "Information about this site!" },
    { name: "Trombone Champ Charts", url: "/TromboneChamp/ChartList.html", desc: "My Trombone Champ Charts!" },
    { name: "Character List", url: "/Characters/List.html", desc: "A list of my OCs!" },
    { name: "Ether", url: "/Characters/Ether/Info.html", desc: "Ether's page!" }
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
                a.textContent = `${page.name} // ${page.desc}`;
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