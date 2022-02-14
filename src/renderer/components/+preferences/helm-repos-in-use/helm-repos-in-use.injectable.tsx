/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { asyncComputed, IAsyncComputed } from "@ogre-tools/injectable-react";
import { apiBase } from "../../../../common/k8s-api";
import { Notifications } from "../../notifications";
import React from "react";
import type {
  HelmRepo,
} from "../../../../common/helm-repo";

export interface RemovableHelmRepo extends HelmRepo {
  remove: () => Promise<void>;
}

const removeHelmRepo = (repo: HelmRepo, helmReposInUse: IAsyncComputed<HelmRepo[]>) => async () => {
  try {
    await apiBase.del("/v2/repos", {
      data: { name: repo.name, url: repo.url },
    });

    helmReposInUse.invalidate();
  } catch (err) {
    Notifications.error(
      <>
        Removing helm branch <b>{repo.name}</b> has failed: {String(err)}
      </>,
    );
  }
};

const helmReposInUseInjectable = getInjectable({
  id: "helm-repos-in-use",

  instantiate: () => {
    const helmReposInUse = asyncComputed(async (): Promise<RemovableHelmRepo[]> => {
      const repos = await apiBase.get<HelmRepo[]>("/v2/repos");

      return repos.map((repo) => ({
        ...repo,

        remove: removeHelmRepo(repo, helmReposInUse),
      }));
    });

    return helmReposInUse;
  },
});

export default helmReposInUseInjectable;
