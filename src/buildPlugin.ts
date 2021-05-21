import fs from "fs/promises";
import { Plugin } from "vite";
import { debug } from "./logger";
import { ResolvedPluginOptions } from "./resolveOptions";
import { PLUGIN_IDENTIFIER } from "./constants";

export function createBuildPlugin(options: ResolvedPluginOptions): Plugin {
  const fakeHtmlToRealPathMap: Record<string, string> = {};

  return {
    name: `${PLUGIN_IDENTIFIER}:build`,
    enforce: "pre",
    apply: "build",

    resolveId(id: string) {
      console.log(id);
      if (id.endsWith("/index.html")) return id;

      if (
        options.build.treatAsHtml?.some((extension) => id.endsWith(extension))
      ) {
        const newPath = `${
          id.slice(0, Math.max(0, id.lastIndexOf("."))) || id
        }.html`;

        debug`Resolving extension to treat as HTML resolveId(${id}), fake path: ${newPath}`;

        fakeHtmlToRealPathMap[newPath] = id;

        return newPath;
      }
    },
    async load(id) {
      let fileToRead;
      if (id.endsWith("/index.html")) {
        debug`Detected load(/index.html)`;

        fileToRead =
          typeof options.build.index === "string"
            ? options.build.index
            : options.build.index?.(id) ?? id;
      } else if (fakeHtmlToRealPathMap[id]) {
        debug`Detected extension to treat as HTML load(${id})`;
        fileToRead = fakeHtmlToRealPathMap[id];
      }

      if (fileToRead) {
        if (fileToRead.startsWith("/")) {
          fileToRead = fileToRead.slice(1);
        }

        debug`Read path: ${fileToRead}`;
        return await fs.readFile(fileToRead, {
          encoding: "utf-8",
        });
      }
    },
  };
}
