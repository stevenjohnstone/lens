/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LensApiRequest } from "../router";
import logger from "../logger";
import { routeInjectionToken } from "../router/router.injectable";
import {
  appName,
  isDevelopment,
  publicPath,
  webpackDevServerPort,
} from "../../common/vars";
import path from "path";
import readFileInjectable from "../../common/fs/read-file.injectable";

function getMimeType(filename: string) {
  const mimeTypes: Record<string, string> = {
    html: "text/html",
    txt: "text/plain",
    css: "text/css",
    gif: "image/gif",
    jpg: "image/jpeg",
    png: "image/png",
    svg: "image/svg+xml",
    js: "application/javascript",
    woff2: "font/woff2",
    ttf: "font/ttf",
  };

  return mimeTypes[path.extname(filename).slice(1)] || "text/plain";
}

interface Dependencies {
  readFile: (path: string) => Promise<Buffer>
}

const staticFileRoute = ({ readFile }: Dependencies) => async ({
  params,
  response,
  raw: { req },
}: LensApiRequest): Promise<void> => {
  const staticPath = path.resolve(__static);

  let filePath = params.path;

  for (let retryCount = 0; retryCount < 5; retryCount += 1) {
    const asset = path.join(staticPath, filePath);
    const normalizedFilePath = path.resolve(asset);

    if (!normalizedFilePath.startsWith(staticPath)) {
      response.statusCode = 404;

      return response.end();
    }

    try {
      const filename = path.basename(req.url);
      // redirect requests to [appName].js, [appName].html /sockjs-node/ to webpack-dev-server (for hot-reload support)
      const toWebpackDevServer =
        filename.includes(appName) ||
        filename.includes("hot-update") ||
        req.url.includes("sockjs-node");

      if (isDevelopment && toWebpackDevServer) {
        const redirectLocation = `http://localhost:${webpackDevServerPort}${req.url}`;

        response.statusCode = 307;
        response.setHeader("Location", redirectLocation);

        return response.end();
      }

      const data = await readFile(asset);

      response.setHeader("Content-Type", getMimeType(asset));
      response.write(data);
      response.end();
    } catch (err) {
      if (retryCount > 5) {
        logger.error("handleStaticFile:", err.toString());
        response.statusCode = 404;

        return response.end();
      }

      filePath = `${publicPath}/${appName}.html`;
    }
  }
};

const staticFileRouteInjectable = getInjectable({
  id: "static-file-route",

  instantiate: (di) => ({
    method: "get",
    path: `/{path*}`,
    handler: staticFileRoute({ readFile: di.inject(readFileInjectable) }),
  }),

  injectionToken: routeInjectionToken,
});

export default staticFileRouteInjectable;
