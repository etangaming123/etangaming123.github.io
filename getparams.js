const params = new URLSearchParams(window.location.search); // Get params
const fromParam = params.get('from'); // Get specific param

const dymanicTextElement = document.getElementById("dynamic-text-element"); // Get the element to change

const visitsFrom = ["Discord", "Youtube", "GitHub", "Instagram"] // Avaliable visit pages

if (fromParam && visitsFrom.includes(fromParam)) { // If the param exists and it is in the array "visitsFrom"
    dymanicTextElement.textContent = `I see you're visiting from ${fromParam}!` // Change the text
}