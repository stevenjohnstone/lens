/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { readHelmConfig } from "./read-helm-config";
import readFileInjectable from "../../../../../common/fs/read-file.injectable";

const readHelmConfigInjectable = getInjectable({
  id: "read-helm-config",
  instantiate: (di) =>
    readHelmConfig({ readFile: di.inject(readFileInjectable) }),
});

export default readHelmConfigInjectable;
