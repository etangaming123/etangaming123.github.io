const params = new URLSearchParams(window.location.search); // Get params
const messageParam = params.get('id'); // Get specific param

const messageElement = document.getElementById("message"); // Get the element to change
const statusElement = document.getElementById("status"); 

async function replaceText(id) {
    try {
        const response = await fetch(`https://gist.githubusercontent.com/etangaming123/${id}/raw`) // MY gists thank you very much >:P
        if (!response.ok) {
            if (response.status == 404) {
                messageElement.textContent = "The message id you inputted does not exist. (if it worked before, it may have been deleted!)"
                return
            }
            messageElement.textContent = `Failed to get message! Status: ${response.status}`
            return
        }
        text = await response.text()
        if (/^https?:\/\/\S+$/.test(text)) {
            window.location.href = text;
        }    
        const html = text
            .replace(/(https?:\/\/[\w\-.~:?#[\]@!$&'()*+,;=\/]+)(?![^<]*?>)/g, '<a href="$1" class="external-link" target="_blank">$1</a>')
            .replace(/\n/g, '<br>');
        messageElement.innerHTML = html;
        statusElement.innerHTML = `<a href=https://gist.githubusercontent.com/etangaming123/${id}/raw class="external-link" target="_blank">View raw</a> // <a href=https://gist.githubusercontent.com/etangaming123/${id}/revisions class="external-link" target="_blank">View update history</a>`;
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