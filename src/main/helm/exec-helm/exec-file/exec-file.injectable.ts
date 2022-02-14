/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { promiseExecFile } from "../../../../common/utils";

const execFileInjectable = getInjectable({
  id: "exec-file",
  instantiate: () => promiseExecFile,
  causesSideEffects: true,
});

export default execFileInjectable;
