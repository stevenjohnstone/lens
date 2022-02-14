/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { HelmCli } from "../helm-cli";
import type { ExecFileOptions } from "child_process";
import type { BaseEncodingOptions } from "fs";
import logger from "../../logger";

interface Dependencies {
  helmCli: HelmCli
  execFile: (path: string, args: string[], options: BaseEncodingOptions & ExecFileOptions) => Promise<{ stdout: string }>
}

export const execHelm = ({ helmCli, execFile } : Dependencies) =>  async (args: string[], options?: BaseEncodingOptions & ExecFileOptions): Promise<string> => {
  helmCli.setLogger(logger);

  const helmCliPath = await helmCli.binaryPath();

  try {
    const { stdout } = await execFile(helmCliPath, args, options);

    return stdout;
  } catch (error) {
    throw error?.stderr || error;
  }
};
