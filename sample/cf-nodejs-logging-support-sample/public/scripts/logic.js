document.addEventListener('DOMContentLoaded', () => {

    const collection = Array.from(document.getElementsByClassName("btn"));
    const feedback = document.getElementById("feedback");
    const binding = document.getElementById("binding_information");

    // Getting currently working binding information
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "binding_information");
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == XMLHttpRequest.DONE) {
            console.log("testing")
            console.log(xhttp.responseText)
            binding.innerHTML = xhttp.responseText
        }
    }

    collection.forEach(
        (element) => {
            element.addEventListener("click", () => {
                var xhttp = new XMLHttpRequest();
                xhttp.open("GET", element.getAttribute('targetpath'));
                xhttp.send();
                xhttp.onreadystatechange = function() {
                    if (xhttp.readyState == XMLHttpRequest.DONE) {
                        console.log(xhttp.responseText)
                        feedback.innerHTML= xhttp.responseText;
                    }
                }
            });
        }
    );
})
