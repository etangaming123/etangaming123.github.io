document.addEventListener("DOMContentLoaded", () => {
    const dragenabled = localStorage.getItem("draggable");
    if (dragenabled == null) {
        const dragenabled = "true";
        localStorage.setItem("draggable", "true");
    }
    if (dragenabled == "true") {
        const windowElement = document.getElementById("Window");
        const titleBar = document.getElementById("titleBar");

        let isDragging = false;
        let offsetX, offsetY;

        titleBar.addEventListener("mousedown", (event) => {
            isDragging = true;
            offsetX = event.clientX - windowElement.offsetLeft;
            offsetY = event.clientY - windowElement.offsetTop;

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });

        function onMouseMove(event) {
            if (isDragging) {
                windowElement.style.left = `${event.clientX - offsetX}px`;
                windowElement.style.top = `${event.clientY - offsetY}px`;
            }
        }

        function onMouseUp() {
            isDragging = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

        windowElement.style.position = "absolute";
    }
});
