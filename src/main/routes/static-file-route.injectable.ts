/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type {
  LensApiRequest,
  LensApiResult, SupportedFileExtension,
} from "../router";
import { contentTypes } from "../router";
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

interface Dependencies {
  readFile: (path: string) => Promise<Buffer>
}

const staticFileRoute = ({ readFile }: Dependencies) => async ({
  params,
  raw: { req },
}: LensApiRequest): Promise<LensApiResult> => {
  const staticPath = path.resolve(__static);


  let filePath = params.path;

  for (let retryCount = 0; retryCount < 5; retryCount += 1) {
    const asset = path.join(staticPath, filePath);

    const normalizedFilePath = path.resolve(asset);

    if (!normalizedFilePath.startsWith(staticPath)) {
      return { statusCode: 404 };
    }

    try {
      const filename = path.basename(req.url);

      // redirect requests to [appName].js, [appName].html /sockjs-node/ to webpack-dev-server (for hot-reload support)
      const toWebpackDevServer =
        filename.includes(appName) ||
        filename.includes("hot-update") ||
        req.url.includes("sockjs-node");

      if (isDevelopment && toWebpackDevServer) {
        return {
          statusCode: 307,

          headers: {
            Location: `http://localhost:${webpackDevServerPort}${req.url}`,
          },
        };
      }

      const fileExtension = path
        .extname(asset)
        .slice(1) as SupportedFileExtension;

      const contentType = contentTypes[fileExtension] || contentTypes.txt;

      return { response: await readFile(asset), contentType };

    } catch (err) {
      if (retryCount > 5) {
        logger.error("handleStaticFile:", err.toString());

        return { statusCode: 404 };
      }

      filePath = `${publicPath}/${appName}.html`;
    }
  }

  return { statusCode: 404 };
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
