/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execHelmInjectable from "../../exec-helm/exec-helm.injectable";
import { addHelmRepository } from "./add-helm-repository";

const addHelmRepositoryInjectable = getInjectable({
  id: "add-helm-repository",

  instantiate: (di) =>
    addHelmRepository({ execHelm: di.inject(execHelmInjectable) }),
});

export default addHelmRepositoryInjectable;
