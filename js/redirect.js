document.addEventListener("DOMContentLoaded", async function() {
    const params = new URLSearchParams(window.location.search); // Get params
    const redirectparam = params.get('redirect'); // Get specific param

    const autoloadurllist = localStorage.getItem("autoloadurllist")
    const autoloadallurls = localStorage.getItem("disableredirectnotice")
   
    const redirectnotice = document.getElementById("redirectnotice")
    const gotobutton = document.getElementById("gotobutton")
    const donttellmeagain = document.getElementById("donttellmeagain")
    const addtotrusted = document.getElementById("trustthisdomain")
    const statustext = document.getElementById("statustext")

    if (redirectparam == null) {
        window.location.href = "Home.html" // nuh uh
    } 

    let autoloadList = [];
    let autoloadAll = false;

    try {
        if (autoloadurllist) {
            autoloadList = JSON.parse(autoloadurllist);
        }
    } catch (e) {
        autoloadList = [];
    }

    if (autoloadallurls === "true" || autoloadallurls === true) {
        autoloadAll = true;
    }

    // Helper to extract domain from a URL
    function getDomain(url) {
        try {
            return new URL(url).hostname;
        } catch (e) {
            return null;
        }
    }

    const redirectDomain = getDomain(redirectparam);

    if (
        autoloadAll ||
        (redirectDomain && Array.isArray(autoloadList) && autoloadList.includes(redirectDomain))
    ) {
        window.location.href = redirectparam;
        return;
    }

    redirectnotice.innerHTML = `You're about to be redirected to an external link:<br>${redirectparam}<br>Would you like to proceed? (press back on your browser if no, or use the topbar to go back!)`
    gotobutton.innerHTML = `Go to ${redirectparam}`

    gotobutton.addEventListener("click", function() {
        if (redirectparam) {
            window.location.href = redirectparam;
        }
    });

    donttellmeagain.addEventListener("click", function() {
        if (localStorage.getItem("donttellmeagain") == true) {
            localStorage.setItem("donttellmeagain", false)
            statustext.textContent = "You will now see this page when clicking an external link."
        }

        else {
            localStorage.setItem("donttellmeagain", true)
            statustext.textContent = "You will no longer see this page when clicking an external link. (this can be changed in settings!)"
        }
    });

    addtotrusted.addEventListener("click", function() {
        if (redirectDomain) {
            if (autoloadList.includes(redirectDomain)) {
                statustext.textContent = `${redirectDomain} is already in your trusted list!`
            } else {
                autoloadList.push(redirectDomain);
                localStorage.setItem("autoloadurllist", JSON.stringify(autoloadList));
                statustext.textContent = `${redirectDomain} has been added to your trusted list! Your trusted list can be viewed and managed in settings.`
            }
        } else {
            statustext.textContent = "Invalid URL, cannot add to trusted list."
        }
    });
});