import RootLogger from "./lib/logger/rootLogger";
const rootLogger = RootLogger.getInstance();

module.exports = rootLogger; // assign default export
exports = module.exports; // re-assign exports

export default rootLogger;
export * from "./lib/config/interfaces";
export * from "./lib/logger/record";
export * from "./lib/logger/level";
export * from "./lib/logger/logger";
export * from "./lib/plugins/interfaces";
export * from "./lib/plugins/defaultOutput";
export * from "./lib/plugins/otelOutput";
