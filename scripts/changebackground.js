async function setUserBg(color) {
    statustext = document.getElementById("status-text")
    if (color == "none") {
        localStorage.removeItem("userbg");
    }
    else {
        localStorage.setItem("userbg", color);
    }
    const scrollingBackground = document.querySelector(".scrolling-background");

    userbg = localStorage.getItem("userbg")

    if (userbg == null) {
        const gistUrl = "https://gist.githubusercontent.com/etangaming123/071d58869981c2a5a56c2f3ff11aebc9/raw";

        try {
            const response = await fetch(gistUrl);
            const fileName = await response.text();
    
            scrollingBackground.style.backgroundImage = `url('./images/backgrounds/${fileName}')`;
        } catch (error) {
            console.error("Error fetching Gist data:", error);
            scrollingBackground.style.backgroundImage = `url('./images/backgrounds/bg.png')`;
        }    
    }

    else {
        scrollingBackground.style.backgroundImage = `url('./images/backgrounds/${userbg}bg.png')`;
    }
    if (color == "") {
        statustext.innerText = `Set background to plain!`
    }
    else {
        statustext.innerText = `Set background to ${color}!`
    }
}