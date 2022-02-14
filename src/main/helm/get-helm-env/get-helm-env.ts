/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
interface Dependencies {
  execHelm: (args: string[]) => Promise<string>
}

export type HelmEnv = Record<string, string> & {
  HELM_REPOSITORY_CACHE?: string;
  HELM_REPOSITORY_CONFIG?: string;
};

export const getHelmEnv = ({ execHelm }: Dependencies) => async () => {
  const output = await execHelm(["env"]);

  const lines = output.split(/\r?\n/); // split by new line feed
  const env: HelmEnv = {};

  lines.forEach((line: string) => {
    const [key, value] = line.split("=");

    if (key && value) {
      env[key] = value.replace(/"/g, ""); // strip quotas
    }
  });

  return env;

};
