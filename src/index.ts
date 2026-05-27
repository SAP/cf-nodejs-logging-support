import RootLogger from "./lib/logger/rootLogger.js";
const rootLogger = RootLogger.getInstance();

export default rootLogger;
export * from "./lib/config/interfaces.js";
export * from "./lib/logger/level.js";
export * from "./lib/logger/logger.js";
