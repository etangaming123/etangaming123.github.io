document.addEventListener("DOMContentLoaded", async function() {
    const params = new URLSearchParams(window.location.search); // Get params
    const redirectparam = params.get('redirect'); // Get specific param
   
    const redirectnotice = document.getElementById("redirectnotice")
    const gotobutton = document.getElementById("gotobutton")

    if (redirectparam == null) {
        window.location.href = "Home.html" // nuh uh
    } 

    redirectnotice.innerHTML = `You're about to be redirected to an external link:<br>${redirectparam}<br>Would you like to proceed? (press back on your browser if no, or use the topbar to go back!)`
    gotobutton.innerHTML = `Go to ${redirectparam}`

    gotobutton.addEventListener("click", function() {
        console.log("registered")
        if (redirectparam) {
            window.location.href = redirectparam;
        }
    });
});
