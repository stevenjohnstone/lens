/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { AddHelmRepoDialogModel } from "./add-helm-repo-dialog-model";

const addHelmRepoDialogModelInjectable = getInjectable({
  id: "add-helm-repo-dialog-model",
  instantiate: () => new AddHelmRepoDialogModel(),
});

export default addHelmRepoDialogModelInjectable;
