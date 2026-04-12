randopelement = document.getElementById("rando");

quotes = [
    "‘You are the light of the world. A city built on a hill cannot be hidden.'",
    "Welcome to maimai!",
    "zzzzzz mimimimi",
    "git add .env",
    "<3 github pages",
    "Hello, dear viewer!",
    "Curious or are you just stalking me? (just kidding - maybe)",
    "Watch out for rogue NFC tags n QR codes!",
    "Do you have a pending software update?",
    "Believe in yourself.",
    "Time is everything. Once you lose it, you can never get it back.",
    "Seven Twenty Seven"
];

function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

randopelement.innerHTML = getRandomQuote();