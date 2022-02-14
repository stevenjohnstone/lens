/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import type { Route } from "../../../router";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import helmServiceInjectable from "../../../helm/helm-service.injectable";

const rollbackReleaseRouteInjectable = getInjectable({
  id: "rollback-release-route",

  instantiate: (di): Route<void> => {
    const helmService = di.inject(helmServiceInjectable);

    return {
      method: "put",
      path: `${apiPrefix}/v2/releases/{namespace}/{release}/rollback`,

      handler: async (request) => {
        const { cluster, params, payload } = request;

        await helmService.rollback(
          cluster,
          params.release,
          params.namespace,
          payload.revision,
        );
      },
    };
  },

  injectionToken: routeInjectionToken,
});

export default rollbackReleaseRouteInjectable;
