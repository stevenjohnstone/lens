/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execHelmInjectable from "../../exec-helm/exec-helm.injectable";
import { removeHelmRepository } from "./remove-helm-repository";
import loggerInjectable from "../../../../common/logger.injectable";

const removeHelmRepositoryInjectable = getInjectable({
  id: "remove-helm-repository",

  instantiate: (di) =>
    removeHelmRepository({ execHelm: di.inject(execHelmInjectable), logger: di.inject(loggerInjectable) }),
});

export default removeHelmRepositoryInjectable;
