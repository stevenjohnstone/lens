/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import logger from "../../../logger";
import type { HelmRepo } from "../../../../common/helm-repo";

interface Dependencies {
  execHelm: (args: string[]) => Promise<any>
}

export const addHelmRepository = ({ execHelm } : Dependencies) => async (repo: HelmRepo) => {
  const {
    name,
    url,
    insecureSkipTlsVerify,
    username,
    password,
    caFile,
    keyFile,
    certFile,
  } = repo;

  logger.info(`[HELM]: adding repo ${name} from ${url}`);

  const args = ["repo", "add", name, url];

  if (insecureSkipTlsVerify) {
    args.push("--insecure-skip-tls-verify");
  }

  if (username) {
    args.push("--username", username);
  }

  if (password) {
    args.push("--password", password);
  }

  if (caFile) {
    args.push("--ca-file", caFile);
  }

  if (keyFile) {
    args.push("--key-file", keyFile);
  }

  if (certFile) {
    args.push("--cert-file", certFile);
  }

  await execHelm(args);
};
