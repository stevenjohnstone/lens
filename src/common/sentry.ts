/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Dedupe, Offline } from "@sentry/integrations";
import * as Sentry from "@sentry/electron";
import { sentryDsn, isProduction } from "./vars";
import { UserStore } from "./user-preferences";
import { inspect } from "util";

/**
 * "Translate" 'browser' to 'main' as Lens developer more familiar with the term 'main'
 */
function mapProcessName(processType: string) {
  if (processType === "browser") {
    return "main";
  }

  return processType;
}

/**
 * Initialize Sentry for the current process so to send errors for debugging.
 */
export function SentryInit() {
  const processName = mapProcessName(process.type);

  Sentry.init({
    beforeSend: (event) => {
      // default to false, in case instance of UserStore is not created (yet)
      const allowErrorReporting = UserStore.getInstance(false)?.allowErrorReporting ?? false;

      if (allowErrorReporting) {
        return event;
      }

      /**
       * Directly write to stdout so that no other integrations capture this and create an infinite loop
       */
      process.stdout.write(`🔒  [SENTRY-BEFORE-SEND-HOOK]: allowErrorReporting: ${allowErrorReporting}. Sentry event is caught but not sent to server.`);
      process.stdout.write("🔒  [SENTRY-BEFORE-SEND-HOOK]: === START OF SENTRY EVENT ===");
      process.stdout.write(inspect(event, false, null, true));
      process.stdout.write("🔒  [SENTRY-BEFORE-SEND-HOOK]: ===  END OF SENTRY EVENT  ===");

      // if return null, the event won't be sent
      // ref https://github.com/getsentry/sentry-javascript/issues/2039
      return null;
    },
    dsn: sentryDsn,
    integrations: [
      new Dedupe(),
      new Offline(),
    ],
    initialScope: {
      tags: {
        "process": processName,
      },
    },
    environment: isProduction ? "production" : "development",
  });
}
