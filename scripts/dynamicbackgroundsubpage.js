document.addEventListener("DOMContentLoaded", async function() {
    const params = new URLSearchParams(window.location.search); // Get params
    const bgparam = params.get('bg'); // Get specific param
    const scrollingBackground = document.querySelector(".scrolling-background");

    if (bgparam == null) {
        userbg = localStorage.getItem("userbg")
    
        if (userbg == null) {
            const gistUrl = "https://gist.githubusercontent.com/etangaming123/071d58869981c2a5a56c2f3ff11aebc9/raw";
    
            try {
                const response = await fetch(gistUrl);
                const fileName = await response.text();
        
                scrollingBackground.style.backgroundImage = `url('../images/backgrounds/${fileName}')`;
            } catch (error) {
                console.error("Error fetching Gist data:", error);
                scrollingBackground.style.backgroundImage = `url('../images/backgrounds/bg.png')`;
            }    
        }
    
        else {
            scrollingBackground.style.backgroundImage = `url('../images/backgrounds/${userbg}bg.png')`;
            }
        }

    else {
        scrollingBackground.style.backgroundImage = `url('../images/backgrounds/${bgparam}bg.png')`;
    }
});
