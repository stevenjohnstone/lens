/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IAsyncComputed } from "@ogre-tools/injectable-react";
import { Notifications } from "../../notifications";
import React from "react";
import { apiBase } from "../../../../common/k8s-api";
import type {
  HelmRepo,
} from "../../../../common/helm-repo";

interface Dependencies {
  helmReposInUse: IAsyncComputed<HelmRepo[]>;
}

export const addHelmRepository =
  ({ helmReposInUse }: Dependencies) =>
    async (repo: HelmRepo) => {
      try {
        await apiBase.post("/v2/repos", {
          data: {
            name: repo.name,
            url: repo.url,
            insecureSkipTlsVerify: repo.insecureSkipTlsVerify,
            username: repo.username,
            password: repo.password,
            caFile: repo.caFile,
            keyFile: repo.keyFile,
            certFile: repo.certFile,
          },
        });

        helmReposInUse.invalidate();
      } catch (err) {
        Notifications.error(
          <>
          Adding helm branch <b>{repo.name}</b> has failed: {String(err)}
          </>,
        );
      }
    };
