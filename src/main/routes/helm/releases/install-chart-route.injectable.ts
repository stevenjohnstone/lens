/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import type { Route } from "../../../router";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import helmServiceInjectable from "../../../helm/helm-service.injectable";

interface InstallChartResponse {
  log: string;
  release: { name: string, namespace: string }
}

const installChartRouteInjectable = getInjectable({
  id: "install-chart-route",

  instantiate: (di): Route<InstallChartResponse> => {
    const helmService = di.inject(helmServiceInjectable);

    return {
      method: "post",
      path: `${apiPrefix}/v2/releases`,

      handler: async (request) => {
        const { payload, cluster } = request;

        return {
          response: await helmService.installChart(cluster, payload),
          statusCode: 201,
        };
      },
    };
  },

  injectionToken: routeInjectionToken,
});

export default installChartRouteInjectable;
