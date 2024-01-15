"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PluginProvider {
    constructor() {
        this.outputPlugins = [];
    }
    static getInstance() {
        if (!PluginProvider.instance) {
            PluginProvider.instance = new PluginProvider();
        }
        return PluginProvider.instance;
    }
    addOutputPlugin(outputPlugin) {
        this.outputPlugins.push(outputPlugin);
    }
    setOutputPlugins(outputPlugins) {
        this.outputPlugins = outputPlugins;
    }
    getOutputPlugins() {
        return this.outputPlugins;
    }
}
exports.default = PluginProvider;
//# sourceMappingURL=pluginProvider.js.map