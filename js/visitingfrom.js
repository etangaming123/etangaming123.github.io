const params = new URLSearchParams(window.location.search); 
const fromParam = params.get('from'); 
const isqr = params.get('qr')

const dymanicTextElement = document.getElementById("visitingfrom");

const visitsFrom = ["discord", "youtube", "github", "instagram", "bluesky", "steam", "roblox", "osu", "guilded", "twitter"] 

if (isqr && isqr === "true") {
    dymanicTextElement.textContent = `Did you like my qr code? :P` 
}

if (fromParam && visitsFrom.includes(fromParam)) { 
    const userVisitedFrom = fromParam.charAt(0).toUpperCase() + fromParam.slice(1) 
    dymanicTextElement.textContent = `Hello from ${userVisitedFrom}!` 
}