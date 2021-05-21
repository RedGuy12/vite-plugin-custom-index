export type ModeOptions = {
  index?: string | ((path: string) => string);
  treatAsHtml?: string[];
};

export type ResolvedPluginOptions = {
  dev: ModeOptions;
  build: ModeOptions;
};

export type PluginOptions =
  | string
  | ModeOptions
  | (Partial<ModeOptions> & ResolvedPluginOptions);

export function resolveOptions(
  options: PluginOptions
): ResolvedPluginOptions | false {
  if (typeof options === "string" || typeof options === "function") {
    return { dev: { index: options }, build: { index: options } };
  }

  if (options.index) {
    if ("dev" in options || "build" in options) {
      return {
        dev:
          typeof options.dev === "string"
            ? { index: options.dev }
            : options.dev,
        build:
          typeof options.build === "string"
            ? { index: options.build }
            : options.build,
      };
    } else {
      return { dev: options, build: options };
    }
  } else {
    return false;
  }
}
