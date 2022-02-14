/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getHelmRepositoriesInjectable
  from "../get-helm-repositories/get-helm-repositories.injectable";
import { matches } from "lodash/fp";

const getHelmRepositoryInjectable = getInjectable({
  id: "get-helm-repository",

  instantiate: (di) => {
    const getRepositories = di.inject(getHelmRepositoriesInjectable);

    return async (name: string) => {
      const repositories = await getRepositories();

      return repositories.find(matches({ name }));
    };
  },
});

export default getHelmRepositoryInjectable;
