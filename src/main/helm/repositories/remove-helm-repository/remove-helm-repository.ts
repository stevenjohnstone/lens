/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { HelmRepo } from "../../../../common/helm-repo";
import type { Logger } from "../../../../common/logger";

interface Dependencies {
  execHelm: (args: string[]) => Promise<any>
  logger: Logger
}

export const removeHelmRepository = ({ execHelm, logger } : Dependencies) => async (repo: HelmRepo) => {
  logger.info(`[HELM]: removing repo ${repo.name} (${repo.url})`);

  await execHelm([
    "repo",
    "remove",
    repo.name,
  ]);
};
