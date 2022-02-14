/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import type { Route } from "../../../router";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import helmServiceInjectable from "../../../helm/helm-service.injectable";

const deleteReleaseRouteInjectable = getInjectable({
  id: "delete-release-route",

  instantiate: (di): Route<string> => {
    const helmService = di.inject(helmServiceInjectable);

    return {
      method: "delete",
      path: `${apiPrefix}/v2/releases/{namespace}/{release}`,

      handler: async (request) => {
        const { cluster, params } = request;

        return {
          response: await helmService.deleteRelease(
            cluster,
            params.release,
            params.namespace,
          ),
        };
      },
    };
  },

  injectionToken: routeInjectionToken,
});

export default deleteReleaseRouteInjectable;
