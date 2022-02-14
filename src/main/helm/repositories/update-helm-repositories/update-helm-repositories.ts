/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
interface Dependencies {
  execHelm: (args: string[]) => Promise<any>;
}

export const updateHelmRepositories =
  ({ execHelm }: Dependencies) =>
    async () =>
      await execHelm(["repo", "update"]);
