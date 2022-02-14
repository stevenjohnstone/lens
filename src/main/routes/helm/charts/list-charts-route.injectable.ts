/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../../router/router.injectable";
import type { Route } from "../../../router";
import { apiPrefix } from "../../../../common/vars";
import helmServiceInjectable from "../../../helm/helm-service.injectable";

const listChartsRouteInjectable = getInjectable({
  id: "list-charts-route",

  instantiate: (di): Route<any> => {
    const helmService = di.inject(helmServiceInjectable);

    return {
      method: "get",
      path: `${apiPrefix}/v2/charts`,

      handler: async () => ({
        response: await helmService.listCharts(),
      }),
    };
  },

  injectionToken: routeInjectionToken,
});

export default listChartsRouteInjectable;
