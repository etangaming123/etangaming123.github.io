document.addEventListener("DOMContentLoaded", async function() {
    const gistUrl = "https://gist.githubusercontent.com/etangaming123/071d58869981c2a5a56c2f3ff11aebc9/raw";

    try {
        const response = await fetch(gistUrl);
        const fileName = await response.text();

        const scrollingBackground = document.querySelector(".scrolling-background");
        if (scrollingBackground) {
            scrollingBackground.style.backgroundImage = `url('../images/backgrounds/${fileName}')`;
        } else {
            console.error("Element with class .scrolling-background not found!");
        }
    } catch (error) {
        console.error("Error fetching Gist data:", error);
    }
});
