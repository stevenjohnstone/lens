/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../../../router/router.injectable";
import { apiPrefix } from "../../../../../common/vars";
import type { Route } from "../../../../router";
import addHelmRepositoryInjectable from "../../../../helm/repositories/add-helm-repository/add-helm-repository.injectable";

const addHelmRepositoryRouteInjectable = getInjectable({
  id: "helm-route-add-repo",

  instantiate: (di): Route<void> => {
    const addHelmRepository = di.inject(addHelmRepositoryInjectable);

    return {
      method: "post",
      path: `${apiPrefix}/v2/repos`,

      handler: async (request) => {
        const repo = request.payload;

        await addHelmRepository(repo);
      },
    };
  },

  injectionToken: routeInjectionToken,
});

export default addHelmRepositoryRouteInjectable;
