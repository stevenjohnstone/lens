/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import helmReposInUseInjectable from "../helm-repos-in-use/helm-repos-in-use.injectable";
import { addHelmRepository } from "./add-helm-repository";

const addHelmRepositoryInjectable = getInjectable({
  id: "add-helm-repo",
  instantiate: (di) => addHelmRepository({
    helmReposInUse: di.inject(helmReposInUseInjectable),
  }),
});

export default addHelmRepositoryInjectable;
