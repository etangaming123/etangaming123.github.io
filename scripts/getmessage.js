const params = new URLSearchParams(window.location.search); // Get params
const messageParam = params.get('id'); // Get specific param

const messageElement = document.getElementById("message"); // Get the element to change
const statusElement = document.getElementById("status"); 

async function replaceText(id) {
    try {
        const response = await fetch(`https://gist.githubusercontent.com/etangaming123/${id}/raw`) // MY gists thank you very much >:P
        if (!response.ok) {
            messageElement.textContent = `Failed to get message! Status: ${response.status}`
            return
        }
        text = await response.text()
        messageElement.innerText = text.replace("/\n\g", "\n")
        statusElement.innerHTML = `Message from <a href=https://gist.githubusercontent.com/etangaming123/${id}/raw class="link">https://gist.githubusercontent.com/etangaming123/${id}/raw</a>`;
    }
    catch (error) {
        console.error("Failed to fetch message:", error)
    }
}

if (messageParam) { // If the param exists
    replaceText(messageParam)
}