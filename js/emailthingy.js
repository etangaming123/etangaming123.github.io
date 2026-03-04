const emailtextelement = document.getElementById("waht");
const email = "me@etangaming.xyz";

emailtextelement.href = "https://mail.google.com/mail/u/0/?fs=1&tf=cm&source=mailto&to=" + email;
emailtextelement.textContent = email;