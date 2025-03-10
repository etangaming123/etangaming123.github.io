const params = new URLSearchParams(window.location.search); // Get params
const fromParam = params.get('from'); // Get specific param

const dymanicTextElement = document.getElementById("dynamic-text-element"); // Get the element to change

const visitsFrom = ["discord", "youtube", "github", "instagram"] // Avaliable visit pages

if (fromParam && visitsFrom.includes(fromParam)) { // If the param exists and it is in the array "visitsFrom"
    const userVisitedFrom = fromParam.charAt(0).toUpperCase() + fromParam.slice(1) // Capitalise word
    dymanicTextElement.textContent = `I see you're visiting from ${userVisitedFrom}!` // Change the text
}