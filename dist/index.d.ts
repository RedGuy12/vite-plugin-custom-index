import { Connect, Plugin } from 'vite';

declare type ModeOptions = {
    index: string | ((request: Connect.IncomingMessage) => string);
    treatAsHtml?: string[];
};
declare type ResolvedPluginOptions = {
    dev: ModeOptions;
    build: ModeOptions;
};
declare type PluginOptions = string | ModeOptions | (Partial<ModeOptions> & ResolvedPluginOptions);

declare function export_default(options: PluginOptions): Plugin[];

export default export_default;
