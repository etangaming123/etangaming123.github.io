const stats = document.getElementById("maimaistats");

async function fetchMaimaiStats() {
    try {
        const response = await fetch("https://gist.githubusercontent.com/etangaming123/43e1c2ee943cca54945b0e018823ccfb/raw/");
        if (!response.ok) {
            stats.textContent = `Failed to load maimai stats! Status: ${response.status}`;
            return;
        }
        const text = await response.text();
        const html = text
            .replace(/(https?:\/\/[\w\-.~:?#[\]@!$&'()*+,;=\/]+)(?![^<]*?>)/g, '<a href="$1" class="external-link" target="_blank">$1</a>')
            .replace(/\n/g, '<br>');
        stats.innerHTML = html;
    }

    catch (error) {
        console.error("Failed to fetch maimai stats:", error);
        stats.textContent = "Failed to load maimai stats due to an error.";
    }
}

fetchMaimaiStats();