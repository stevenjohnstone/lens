/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { execHelm } from "./exec-helm";
import helmCliInjectable from "../helm-cli.injectable";
import execFileInjectable from "./exec-file/exec-file.injectable";
import loggerInjectable from "../../../common/logger.injectable";

const execHelmInjectable = getInjectable({
  id: "exec-helm",
  instantiate: (di) =>
    execHelm({
      helmCli: di.inject(helmCliInjectable),
      execFile: di.inject(execFileInjectable),
      logger: di.inject(loggerInjectable),
    }),
});

export default execHelmInjectable;
