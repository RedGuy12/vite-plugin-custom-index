import { ServerResponse } from "http";
import fs from "fs/promises";
import path from "path";
import { Connect, Plugin, ViteDevServer, send } from "vite";
import { debug } from "./logger";
import { PLUGIN_IDENTIFIER } from "./constants";
import { ResolvedPluginOptions } from "./resolveOptions";

export function createDevPlugin(options: ResolvedPluginOptions): Plugin {
  const pathsToHmrReload: Record<string, string> = {};

  return {
    name: `${PLUGIN_IDENTIFIER}:serve`,
    enforce: "pre",

    handleHotUpdate(context) {
      if (pathsToHmrReload[context.file]) {
        context.server.ws.send({
          type: "full-reload",
          path: pathsToHmrReload[context.file],
        });
      }
    },

    configureServer(viteServer: ViteDevServer) {
      viteServer.middlewares.use(async function vitePluginCustomIndex(
        request,
        response,
        next
      ) {
        if (!request.url) return next();

        if (
          options.dev.treatAsHtml?.some((extension) =>
            request.url?.endsWith(extension)
          )
        ) {
          debug`Found request with extension from treatAsHtml: ${{
            url: request.url,
            originalUrl: request.originalUrl,
          }}`;

          request.url = path.join(viteServer.config.root, request.url);

          if (request.originalUrl) {
            pathsToHmrReload[request.url] = request.originalUrl;
          }
          debug`New path: ${request.url}`;

          try {
            await sendTransformedHtmlFromFile(viteServer, request, response);
          } catch (error) {
            return next(error);
          }
        } else {
          return next();
        }
      });

      return () => {
        viteServer.middlewares.use(async function vitePluginCustomIndex(
          request,
          response,
          next
        ) {
          if (request.url === "/" || request.url?.endsWith("/index.html")) {
            debug`Found request for index.html: ${{
              url: request.url,
              originalUrl: request.originalUrl,
            }}`;

            try {
              request.url =
                typeof options.dev.index === "string"
                  ? options.dev.index
                  : options.dev.index?.(request.url) ?? request.url;
              if (!request.url?.startsWith("/")) {
                request.url = `/${request.url}`;
              }

              if (request.originalUrl) {
                pathsToHmrReload[
                  path.join(viteServer.config.root, request.url)
                ] = request.originalUrl;
              }

              debug`New path: ${request.url}`;
              if (request.url?.endsWith(".html")) {
                debug`New path ends with .html, skipping`;
                // Files ending in .html will get handled by vite automatically
                return next();
              }
              await sendTransformedHtmlFromFile(viteServer, request, response);
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
) {
  debug`Transforming as HTML and sending contents of ${{
    url: request.url,
    originalUrl: request.originalUrl,
  }}`;

  if (!request.url) {
    throw new Error(
      `Attempted to transform requested file, ${JSON.stringify(
        request.url
      )}, as HTML but an unexpected error happened`
    );
  }

  const html = await fs.readFile(request.url, "utf-8");
  send(
    request,
    response,
    await viteServer.transformIndexHtml(request.url, html, request.originalUrl),
    "html"
  );
}
