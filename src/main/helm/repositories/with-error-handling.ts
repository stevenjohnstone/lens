/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { constant } from "lodash/fp";

export interface ErrorHandledResponse<TResponse> {
  callWasSuccessful: boolean;
  error: Error | null;
  response: TResponse | null;
  reasonToBypassErrorReporting: Function | null;
}

type ReasonToBypassErrorReporting = (error: Error) => boolean;

const withErrorHandlingFor =
  (reasonToBypassErrorReporting: ReasonToBypassErrorReporting) =>
    <
      TDecorated extends (...args: any[]) => Promise<any>,
      TReturnType = Awaited<ReturnType<TDecorated>>,
      >(
      toBeDecorated: TDecorated,
    ) =>
      async (
        ...args: Parameters<TDecorated>
      ): Promise<ErrorHandledResponse<TReturnType>> => {
        let response: TReturnType;

        try {
          response = await toBeDecorated(...args);
        } catch (error) {
          if (reasonToBypassErrorReporting(error)) {
            return {
              callWasSuccessful: false,
              error,
              response: null,
              reasonToBypassErrorReporting,
            };
          }

          throw error;
        }

        return {
          callWasSuccessful: true,
          response,
          error: null,
          reasonToBypassErrorReporting: null,
        };
      };

export const withErrorHandling = withErrorHandlingFor(constant(false));
export const withErrorHandlingUnless = withErrorHandlingFor;
