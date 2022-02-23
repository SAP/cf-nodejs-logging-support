document.addEventListener('DOMContentLoaded', () => {

    const collection = Array.from(document.getElementsByClassName("btn"));

    collection.forEach(
        (element) => {
            element.addEventListener("click", () => {
                var xhttp = new XMLHttpRequest();
                xhttp.open("GET", element.getAttribute('targetpath'));
                xhttp.send();
            });
        }
    );
})
