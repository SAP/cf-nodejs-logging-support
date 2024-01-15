import { OutputPlugin } from "../plugins/interfaces";
export default class PluginProvider {
    private static instance;
    private outputPlugins;
    private constructor();
    static getInstance(): PluginProvider;
    addOutputPlugin(outputPlugin: OutputPlugin): void;
    setOutputPlugins(outputPlugins: OutputPlugin[]): void;
    getOutputPlugins(): OutputPlugin[];
}
