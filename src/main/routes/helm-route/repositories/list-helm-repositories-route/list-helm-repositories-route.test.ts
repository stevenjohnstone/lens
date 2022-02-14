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
import readFileInjectable from "../../../../../common/fs/read-file.injectable";

describe("list-helm-repositories-route", () => {
  let router: Router;
  let execFileMock: AsyncFnMock<typeof promiseExecFile>;
  let readFileMock: AsyncFnMock<ReturnType<typeof readFileInjectable["instantiate"]>>;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    di.override(
      parseRequestInjectable,

      () => () =>
        Promise.resolve({
          payload: {},
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

    readFileMock = asyncFn();

    // @ts-ignore
    di.override(readFileInjectable, () => readFileMock);

    await di.runSetups();

    router = di.inject(routerInjectable);
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("when request for listing helm repositories", () => {
    let responseStub: http.ServerResponse;

    beforeEach(() => {
      const clusterStub = {} as Cluster;

      const requestStub = new Request({
        url: `${apiPrefix}/v2/repos`,
        method: "get",
      });

      responseStub = {
        statusCode: undefined,
        setHeader: () => {},
        end: jest.fn(() => {}),
      } as unknown as http.ServerResponse;

      router.route(clusterStub, requestStub, responseStub);
    });

    it("executes Helm command for getting Helm environment", () => {
      expect(execFileMock).toHaveBeenCalledWith(
        "some-helm-cli-path",
        ["env"],
        undefined,
      );
    });

    describe("when Helm environment resolves", () => {
      beforeEach(async () => {
        execFileMock.mockClear();

        await execFileMock.resolve({
          stdout: `HELM_REPOSITORY_CONFIG=some-helm-repository-config-path
HELM_REPOSITORY_CACHE=some-helm-repository-cache-path`,
          stderr: null,
        });
      });

      it("updates Helm repositories", () => {
        expect(execFileMock).toHaveBeenCalledWith(
          "some-helm-cli-path",
          ["repo", "update"],
          undefined,
        );
      });

      describe("when updating Helm repositories resolve", () => {
        beforeEach(async () => {
          execFileMock.mockClear();

          await execFileMock.resolve({ stdout: "irrelevant", stderr: null });
        });

        it("reads repositories from Helm config", () => {
          expect(readFileMock).toHaveBeenCalledWith("some-helm-repository-config-path", "utf8");
        });

        describe("given no existing repositories, when Helm config resolves", () => {
          beforeEach(async () => {
            await readFileMock.resolve(Buffer.from(`
apiVersion: ""
generated: "0001-01-01T00:00:00Z"
repositories: []`));
          });

          it('adds "bitnami" as default repository', () => {
            expect(execFileMock).toHaveBeenCalledWith(
              "some-helm-cli-path",
              ["repo", "add", "bitnami", "https://charts.bitnami.com/bitnami"],
              undefined,
            );
          });

          describe("when adding default repository resolves", () => {
            beforeEach(async () => {
              execFileMock.mockClear();
              readFileMock.mockClear();

              await execFileMock.resolve({ stdout: "irrelevant", stderr: null });
            });

            it("reads repositories from Helm config again", () => {
              expect(readFileMock).toHaveBeenCalledWith("some-helm-repository-config-path", "utf8");
            });

            it("when repositories resolve, resolves", async () => {
              await readFileMock.resolve(Buffer.from(`
apiVersion: ""
generated: "0001-01-01T00:00:00Z"
repositories:
  - caFile: ""
    certFile: ""
    insecure_skip_tls_verify: false
    keyFile: ""
    name: bitnami
    pass_credentials_all: false
    password: ""
    url: https://charts.bitnami.com/bitnami
    username: ""`));

              expect(responseStub.statusCode).toBe(200);
              expect(responseStub.end).toHaveBeenCalledWith(
                JSON.stringify([
                  {
                    caFile: "",
                    certFile: "",
                    insecure_skip_tls_verify: false,
                    keyFile: "",
                    name: "bitnami",
                    pass_credentials_all: false,
                    password: "",
                    url: "https://charts.bitnami.com/bitnami",
                    username: "",
                    cacheFilePath: "some-helm-repository-cache-path/bitnami-index.yaml",
                  },
                ]),
              );
            });
          });
        });
      });
    });
  });
});
