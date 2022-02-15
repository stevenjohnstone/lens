/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { includes } from "lodash/fp";
import execHelmInjectable from "../../exec-helm/exec-helm.injectable";
import { updateHelmRepositories } from "./update-helm-repositories";
import { withErrorHandlingUnless } from "../with-error-handling";

export const errorIsAboutNoRepositories = (error: Error) => includes("You must add one before updating", error.message);

const updateHelmRepositoriesInjectable = getInjectable({
  id: "update-helm-repositories",

  instantiate: (di) => {
    const withErrorHandling = withErrorHandlingUnless(errorIsAboutNoRepositories);

    return withErrorHandling(updateHelmRepositories({ execHelm: di.inject(execHelmInjectable) }));
  },
});

export default updateHelmRepositoriesInjectable;
