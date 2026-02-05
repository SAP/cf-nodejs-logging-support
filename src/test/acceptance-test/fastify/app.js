
const importFresh = require('import-fresh');
const fastify = importFresh('fastify');
const log = importFresh('../../../../build/main/index');
const app = fastify();

// Force logger to run the fastify version.
log.setFramework("fastify");

// Add the logger middleware, so each time a request is received, it is will get logged.
app.addHook("onRequest", log.logNetwork);

app.get('/log', function (request, reply) {
    request.logger.setLoggingLevel("info");
    request.logger.logMessage("info", "fastify-message");
    reply.send();
})

app.get("/setcorrelationandtenantid", function (request, reply) {
    request.logger.setCorrelationId("cbc2654f-1c35-45d0-96fc-f32efac20986");
    request.logger.setTenantId("abc8714f-5t15-12h0-78gt-n73jeuc01847");
    request.logger.logMessage("info", "fastify-message");
    reply.send();
});

app.get("/getcorrelationandtenantid", function (request, reply) {
    var correlationId = "cbc2654f-1c35-45d0-96fc-f32efac20986";
    var tenantId = "abc8714f-5t15-12h0-78gt-n73jeuc01847";

    request.logger.setCorrelationId(correlationId);
    request.logger.setTenantId(tenantId);

    if (request.logger.getCorrelationId() == correlationId && request.logger.getTenantId() == tenantId) {
        request.logger.logMessage("info", "successful");
    }
    reply.send();
});

module.exports = app;
