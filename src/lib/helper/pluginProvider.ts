import { OutputPlugin } from "../plugins/interfaces";

export default class PluginProvider {
    private static instance: PluginProvider;
    private outputPlugins: OutputPlugin[];

    private constructor() {
        this.outputPlugins = [];
    }

    static getInstance(): PluginProvider {
        if (!PluginProvider.instance) {
            PluginProvider.instance = new PluginProvider();
        }
        return PluginProvider.instance;
    }

    addOutputPlugin(outputPlugin: OutputPlugin) {
        this.outputPlugins.push(outputPlugin);
    }

    setOutputPlugins(outputPlugins: OutputPlugin[]) {
        this.outputPlugins = outputPlugins;
    }

    getOutputPlugins(): OutputPlugin[] {
        return this.outputPlugins;
    }
}


