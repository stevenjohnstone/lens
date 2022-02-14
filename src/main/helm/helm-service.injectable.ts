/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { HelmService } from "./helm-service";
import getHelmRepositoryInjectable from "./repositories/get-helm-repository/get-helm-repository.injectable";
import getHelmRepositoriesInjectable from "./repositories/get-helm-repositories/get-helm-repositories.injectable";

const helmServiceInjectable = getInjectable({
  id: "helm-service",

  instantiate: (di) => new HelmService({
    getRepository: di.inject(getHelmRepositoryInjectable),
    getRepositories: di.inject(getHelmRepositoriesInjectable),
  }),
});

export default helmServiceInjectable;
