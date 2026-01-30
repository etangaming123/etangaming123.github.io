const params = new URLSearchParams(window.location.search); 
const fromParam = params.get('from'); 
const isqr = params.get('qr')
const isnfc = params.get('nfc')

const dymanicTextElement = document.getElementById("visitingfrom");
const imageElement = document.getElementById("etherLogo");

const visitsFrom = ["discord", "youtube", "github", "instagram", "bluesky", "steam", "roblox", "osu", "guilded", "twitter", "monkeytype", "ollama", "raycast", "tiktok"] 

const rafisolquest = ["discord", "osu", "guilded", "monkeytype", "raycast"]

if (isqr && isqr === "true") {
    dymanicTextElement.textContent = `Did you like my qr code? :P` 
}

if (isnfc && isnfc === "true") {
    dymanicTextElement.textContent = `Did you like my nfc tag? :P` 
}

if (fromParam && visitsFrom.includes(fromParam)) { 
    const userVisitedFrom = fromParam.charAt(0).toUpperCase() + fromParam.slice(1) 
    dymanicTextElement.textContent = `Hello from ${userVisitedFrom}!` 
    if (rafisolquest.includes(fromParam)) {
        imageElement.src = "./images/otherpfps/rafisol_quest.png"
        imageElement.alt = "Rafisol, a character from Puyo Puyo"
    }
    if (fromParam === "ollama") {
        imageElement.src = "./images/otherpfps/llamaburger.png"
        imageElement.alt = "A llama eating a burger."
    }
    if (fromParam === "steam") {
        imageElement.src = "./images/otherpfps/rafisol_steam.png"
        imageElement.alt = "Rafisol [Steam City], a character from Puyo Puyo"
    }
}