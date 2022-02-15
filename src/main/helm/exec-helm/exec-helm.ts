/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { HelmCli } from "../helm-cli";
import type { ExecFileOptions } from "child_process";
import type { BaseEncodingOptions } from "fs";
import type { Logger } from "../../../common/logger";

interface Dependencies {
  helmCli: HelmCli
  execFile: (path: string, args: string[], options: BaseEncodingOptions & ExecFileOptions) => Promise<{ stdout: string }>
  logger: Logger
}

export const execHelm = ({ helmCli, execFile, logger } : Dependencies) =>  async (args: string[], options?: BaseEncodingOptions & ExecFileOptions): Promise<string> => {
  helmCli.setLogger(logger);

  const helmCliPath = await helmCli.binaryPath();

  const actual = await execFile(helmCliPath, args, options);

  return actual.stdout;
};
