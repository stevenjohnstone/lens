/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { helmCli } from "./helm-cli";

const helmCliInjectable = getInjectable({
  id: "helm-cli",
  instantiate: () => helmCli,
});

export default helmCliInjectable;
