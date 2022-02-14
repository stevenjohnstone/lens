/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getDiForUnitTesting } from "../../../../getDiForUnitTesting";
import routerInjectable from "../../../../router/router.injectable";
import type { Router } from "../../../../router";
import type { Cluster } from "../../../../../common/cluster/cluster";
import { Request } from "mock-http";
import type http from "http";
import { apiPrefix } from "../../../../../common/vars";
import parseRequestInjectable from "../../../../router/parse-request.injectable";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import execFileInjectable from "../../../../helm/exec-helm/exec-file/exec-file.injectable";
import type { promiseExecFile } from "../../../../../common/utils";
import helmCliInjectable from "../../../../helm/helm-cli.injectable";
import type { HelmCli } from "../../../../helm/helm-cli";
import mockFs from "mock-fs";

describe("remove-helm-repository-route", () => {
  let router: Router;
  let execFileMock: AsyncFnMock<typeof promiseExecFile>;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    di.override(
      parseRequestInjectable,

      () => () =>
        Promise.resolve({
          payload: { name: "some-repository-name", url: "some-repository-url" },
        }),
    );

    const helmCliStub = {
      setLogger: () => {},
      binaryPath: () => Promise.resolve("some-helm-cli-path"),
    } as unknown as HelmCli;

    di.override(helmCliInjectable, () => helmCliStub);

    execFileMock = asyncFn();

    // @ts-ignore
    di.override(execFileInjectable, () => execFileMock);

    await di.runSetups();

    router = di.inject(routerInjectable);
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("when request for removing helm repository", () => {
    let responseStub: http.ServerResponse;

    beforeEach(() => {
      const clusterStub = {} as Cluster;

      const requestStub = new Request({
        url: `${apiPrefix}/v2/repos`,
        method: "delete",
      });

      responseStub = {
        statusCode: undefined,
        setHeader: () => {},
        end: jest.fn(() => {}),
      } as unknown as http.ServerResponse;

      router.route(clusterStub, requestStub, responseStub);
    });

    it("executes Helm command for removing repository", () => {
      expect(execFileMock).toHaveBeenCalledWith(
        "some-helm-cli-path",
        ["repo", "remove", "some-repository-name"],
        undefined,
      );
    });

    it("when Helm command resolves with success, resolves with success", async () => {
      await execFileMock.resolve({ stdout: '"some-repository-name" has been removed from your repositories', stderr: null });

      expect(responseStub.statusCode).toBe(204);
    });

    it("when Helm command rejects with failure, resolves with failure", async () => {
      await execFileMock.reject(new Error("some-error"));

      expect(responseStub.statusCode).toBe(422);
      expect(responseStub.end).toHaveBeenCalledWith("Error: some-error");
    });
  });
});
