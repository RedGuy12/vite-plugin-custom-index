import { ServerResponse } from "http";
import fs from "fs/promises";
import { Connect, Plugin, ViteDevServer, send } from "vite";
import { debug } from "./logger";
import { PLUGIN_IDENTIFIER } from "./constants";
import { ResolvedPluginOptions } from "./resolveOptions";

export function createDevPlugin(options: ResolvedPluginOptions): Plugin {
  return {
    name: `${PLUGIN_IDENTIFIER}:serve`,
    enforce: "pre",

    configureServer(viteServer: ViteDevServer) {
      return () => {
        viteServer.middlewares.use(async function vitePluginCustomIndex(
          request,
          response,
          next
        ) {
          if (!request.url) return next();

          if (request.url === "/" || request.url === "/index.html") {
            try {
              request.url =
                typeof options.dev.index === "string"
                  ? options.dev.index
                  : options.dev.index(request);
              if (
                !(await sendTransformedHtmlFromFile(
                  viteServer,
                  request,
                  response
                ))
              ) {
                debug`Attempted to transform requested file, ${request.url}, as HTML but an unexpected error happened`;
              }
            } catch (error) {
              return next(error);
            }
          }

          return next();
        });
      };
    },
  };
}

async function sendTransformedHtmlFromFile(
  viteServer: ViteDevServer,
  request: Connect.IncomingMessage,
  response: ServerResponse
): Promise<boolean> {
  if (!request.url) return false;

  const html = await fs.readFile(request.url, "utf-8");
  send(
    request,
    response,
    await viteServer.transformIndexHtml(request.url, html, request.originalUrl),
    "html"
  );
  return true;
}
