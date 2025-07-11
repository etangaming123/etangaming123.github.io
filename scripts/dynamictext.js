const params = new URLSearchParams(window.location.search); // Get params
const fromParam = params.get('from'); // Get specific param
const isqr = params.get('qr')

const dymanicTextElement = document.getElementById("dynamic-text-element"); // Get the element to change

const visitsFrom = ["discord", "youtube", "github", "instagram", "bluesky", "steam", "roblox", "osu", "guilded", "twitter"] // Avaliable visit pages

if (isqr && isqr === "true") {
    dymanicTextElement.textContent = `I see you're visiting from a QR code!` // Change the text
}

if (fromParam && visitsFrom.includes(fromParam)) { // If the param exists and it is in the array "visitsFrom"
    const userVisitedFrom = fromParam.charAt(0).toUpperCase() + fromParam.slice(1) // Capitalise word
    dymanicTextElement.textContent = `I see you're visiting from ${userVisitedFrom}!` // Change the text
}