import { Plugin, ViteDevServer } from "vite";
import { PLUGIN_IDENTIFIER } from "./constants";
import { createDevPlugin } from "./devPlugin";
import { PluginOptions, resolveOptions } from "./resolveOptions";
import { debug } from "./logger";

export default function (options: PluginOptions): Plugin[] {
  const resolvedOptions = resolveOptions(options);
  if (!resolvedOptions) {
    debug`Invalid options: ${resolveOptions}`;
    return [];
  }

  return [createDevPlugin(resolvedOptions)];
}
