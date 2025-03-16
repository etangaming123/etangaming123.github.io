const params = new URLSearchParams(window.location.search); // Get params
const messageParam = params.get('id'); // Get specific param

const messageElement = document.getElementById("message"); // Get the element to change
const statusElement = document.getElementById("status"); 

async function replaceText(id) {
    try {
        const response = await fetch(`https://gist.githubusercontent.com/etangaming123/${id}/raw`) // MY gists thank you very much >:P
        if (!response.ok) {
            if (response.status == 404) {
                messageElement.textContent = "The message id you inputted either does not exist or has been deleted."
                return
            }
            messageElement.textContent = `Failed to get message! Status: ${response.status}`
            return
        }
        text = await response.text()
        const urlMatch = text.match(/https?:\/\/\S+/);
    
        if (urlMatch) { // haha funny redirect on some messages that have links hahdsfhaskj
            window.location.href = urlMatch[0];
        }
        messageElement.innerText = text.replace("/\n\g", "\n")
        statusElement.innerHTML = `Message from <a href=https://gist.githubusercontent.com/etangaming123/${id}/raw class="link">this link</a>`;
    }
    catch (error) {
        console.error("Failed to fetch message:", error)
    }
}

function updateURL() {
    let inputValue = document.getElementById("inputField").value;
    if (inputValue) {
        window.location.href = window.location.pathname + "?id=" + encodeURIComponent(inputValue);
    }
}

if (messageParam) { // If the param exists
    replaceText(messageParam)
}