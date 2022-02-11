document.addEventListener('DOMContentLoaded', () => {

    const globalContext = document.getElementById("global-context");
    const requestContext = document.getElementById("request-context");
    const customFields = document.getElementById("custom-fields");
    const stackTrace = document.getElementById("stack-trace");
    const clientError = document.getElementById("client-error");
    const childLogger = document.getElementById("child-logger");
    const correlationTenantId = document.getElementById("correlation-and-tenant-id");

    globalContext.addEventListener("click", () => {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "globalcontext");
        xhttp.send();
    });
    requestContext.addEventListener("click", () => {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "requestcontext");
        xhttp.send();
    });
    customFields.addEventListener("click", () => {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "customfields");
        xhttp.send();
    });
    stackTrace.addEventListener("click", () => {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "stacktrace");
        xhttp.send();
    });
    clientError.addEventListener("click", () => {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "unknown");
        xhttp.send();
    });
    childLogger.addEventListener("click", () => {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "childlogger");
        xhttp.send();
    });
    correlationTenantId.addEventListener("click", () => {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "correlationandtenantid");
        xhttp.send();
    });
})
