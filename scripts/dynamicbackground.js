document.addEventListener("DOMContentLoaded", async function() {
    const params = new URLSearchParams(window.location.search); // Get params
    const bgparam = params.get('bg'); // Get specific param
    const scrollparam = params.get('scroll'); // Get specific param
    const scrollingBackground = document.querySelector(".scrolling-background");

    if (bgparam == null) {
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
        }

    else {
        scrollingBackground.style.backgroundImage = `url('./images/backgrounds/${bgparam}bg.png')`;
    }

    if (scrollparam == null) {
        scrollingenabled = localStorage.getItem("scrollingenabled");
        if (scrollingenabled == "true") {
            let link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "./css/scroll.css";
            document.head.appendChild(link);    
        }
        else {
            if (scrollingenabled == null) {
                localStorage.setItem("scrollingenabled", "true");
                let link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = "./css/scroll.css"; 
                document.head.appendChild(link);
            }
        }
    }

    else {
        localStorage.setItem("scrollingenabled", scrollparam);
    }

    windowbackground = localStorage.getItem("windowbg");
    if (windowbackground == null) {
        windowbackground = "default";
        localStorage.setItem("windowbg", "default");
    }
    if (windowbackground == "pitch black") {
        element = document.getElementsByClassName("-window")[0]
        element.style.backgroundColor = "#000000";
        localStorage.setItem("windowbg", "pitch black");
    }
    if (windowbackground == "discord") {
        element = document.getElementsByClassName("-window")[0]
        element.style.backgroundColor = "#313338";
        localStorage.setItem("windowbg", "discord");
    }
    document.getElementById("loading-screen").remove();
});
