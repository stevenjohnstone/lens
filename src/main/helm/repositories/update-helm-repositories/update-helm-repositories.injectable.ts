/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execHelmInjectable from "../../exec-helm/exec-helm.injectable";
import { updateHelmRepositories } from "./update-helm-repositories";

const updateHelmRepositoriesInjectable = getInjectable({
  id: "update-helm-repositories",

  instantiate: (di) =>
    updateHelmRepositories({ execHelm: di.inject(execHelmInjectable) }),
});

export default updateHelmRepositoriesInjectable;
