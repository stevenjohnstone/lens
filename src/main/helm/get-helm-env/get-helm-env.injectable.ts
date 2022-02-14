/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execHelmInjectable from "../exec-helm/exec-helm.injectable";
import { getHelmEnv } from "./get-helm-env";

const getHelmEnvInjectable = getInjectable({
  id: "get-helm-env",
  instantiate: (di) => getHelmEnv({ execHelm: di.inject(execHelmInjectable) }),
});

export default getHelmEnvInjectable;
