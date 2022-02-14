/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getHelmRepositoriesInjectable from "../../../../helm/repositories/get-helm-repositories/get-helm-repositories.injectable";
import { routeInjectionToken } from "../../../../router/router.injectable";
import { apiPrefix } from "../../../../../common/vars";
import type { Route } from "../../../../router";
import type { HelmRepo } from "../../../../../common/helm-repo";

const listHelmRepositoriesRouteInjectable = getInjectable({
  id: "helm-route-list-repos",

  instantiate: (di): Route<HelmRepo[]> => {
    const getHelmRepositories = di.inject(getHelmRepositoriesInjectable);

    return {
      method: "get",
      path: `${apiPrefix}/v2/repos`,
      handler: async () => ({ response: await getHelmRepositories() }),
    };
  },

  injectionToken: routeInjectionToken,
});

export default listHelmRepositoriesRouteInjectable;
