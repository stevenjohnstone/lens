/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ErrorHandledResponse } from "../repositories/with-error-handling";

interface Dependencies {
  execHelm: (args: string[]) => Promise<ErrorHandledResponse<string>>
}

export type HelmEnv = Record<string, string> & {
  HELM_REPOSITORY_CACHE?: string;
  HELM_REPOSITORY_CONFIG?: string;
};

export const getHelmEnv = ({ execHelm }: Dependencies) => async () => {
  const { response } = await execHelm(["env"]);

  const lines = response.split(/\r?\n/); // split by new line feed
  const env: HelmEnv = {};

  lines.forEach((line: string) => {
    const [key, value] = line.split("=");

    if (key && value) {
      env[key] = value.replace(/"/g, ""); // strip quotas
    }
  });

  return env;

};
