/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { customRequestPromise } from "../../../../common/request";
import { orderBy } from "lodash/fp";
import type {
  HelmRepo,
} from "../../../../common/helm-repo";

const callForAvailableHelmRepos = async (): Promise<HelmRepo[]> => {
  const { body }: { body: HelmRepo[] } = await customRequestPromise({
    uri: "https://github.com/lensapp/artifact-hub-repositories/releases/download/latest/repositories.json",
    json: true,
    resolveWithFullResponse: true,
    timeout: 10000,
  });

  return orderBy<HelmRepo>("name", "asc", body);
};

const availableHelmReposInjectable = getInjectable({
  id: "available-helm-repos",
  instantiate: () => callForAvailableHelmRepos(),
});

export default availableHelmReposInjectable;
