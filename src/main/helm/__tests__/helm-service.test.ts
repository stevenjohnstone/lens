/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { HelmService } from "../helm-service";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import getHelmRepositoriesInjectable from "../repositories/get-helm-repositories/get-helm-repositories.injectable";
import asyncFn, { AsyncFnMock } from "@async-fn/jest";
import helmServiceInjectable from "../helm-service.injectable";
import type { HelmRepo } from "../../../common/helm-repo";

jest.mock("../helm-chart-manager");

describe("Helm Service tests", () => {
  let getRepositoriesMock: AsyncFnMock<() => Promise<HelmRepo[]>>;
  let helmService: HelmService;

  beforeEach(async () => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    getRepositoriesMock = asyncFn();

    di.override(getHelmRepositoriesInjectable, () => getRepositoriesMock);

    await di.runSetups();

    helmService = di.inject(helmServiceInjectable);
  });

  it("list charts with deprecated entries", async () => {
    const actualPromise = helmService.listCharts();

    await getRepositoriesMock.resolve([
      { name: "stable", url: "stableurl" },
      { name: "experiment", url: "experimenturl" },
    ]);

    const actual = await actualPromise;

    expect(actual).toEqual({
      stable: {
        "apm-server": [
          {
            apiVersion: "3.0.0",
            name: "apm-server",
            version: "2.1.7",
            repo: "stable",
            digest: "test",
            created: "now",
          },
          {
            apiVersion: "3.0.0",
            name: "apm-server",
            version: "2.1.6",
            repo: "stable",
            digest: "test",
            created: "now",
          },
        ],
        "invalid-semver": [
          {
            apiVersion: "3.0.0",
            name: "weird-versioning",
            version: "v4.4.0",
            repo: "stable",
            digest: "test",
            created: "now",
          },
          {
            apiVersion: "3.0.0",
            name: "weird-versioning",
            version: "v4.3.0",
            repo: "stable",
            digest: "test",
            created: "now",
          },
          {
            apiVersion: "3.0.0",
            name: "weird-versioning",
            version: "I am not semver",
            repo: "stable",
            digest: "test",
            created: "now",
          },
          {
            apiVersion: "3.0.0",
            name: "weird-versioning",
            version: "I am not semver but more",
            repo: "stable",
            digest: "test",
            created: "now",
          },
        ],
        "redis": [
          {
            apiVersion: "3.0.0",
            name: "apm-server",
            version: "1.0.0",
            repo: "stable",
            digest: "test",
            created: "now",
          },
          {
            apiVersion: "3.0.0",
            name: "apm-server",
            version: "0.0.9",
            repo: "stable",
            digest: "test",
            created: "now",
          },
        ],
      },
      experiment: {
        "fairwind": [
          {
            apiVersion: "3.0.0",
            name: "fairwind",
            version: "0.0.2",
            repo: "experiment",
            digest: "test",
            deprecated: true,
            created: "now",
          },
          {
            apiVersion: "3.0.0",
            name: "fairwind",
            version: "0.0.1",
            repo: "experiment",
            digest: "test",
            created: "now",
          },
        ],
      },
    });
  });

  it("list charts sorted by version in descending order", async () => {
    const actualPromise = helmService.listCharts();

    await getRepositoriesMock.resolve([
      { name: "bitnami", url: "bitnamiurl" },
    ]);

    const actual = await actualPromise;

    expect(actual).toEqual({
      bitnami: {
        "hotdog": [
          {
            apiVersion: "3.0.0",
            name: "hotdog",
            version: "1.0.2",
            repo: "bitnami",
            digest: "test",
            created: "now",
          },
          {
            apiVersion: "3.0.0",
            name: "hotdog",
            version: "1.0.1",
            repo: "bitnami",
            digest: "test",
            created: "now",
          },
        ],
        "pretzel": [
          {
            apiVersion: "3.0.0",
            name: "pretzel",
            version: "1.0.1",
            repo: "bitnami",
            digest: "test",
            created: "now",
          },
          {
            apiVersion: "3.0.0",
            name: "pretzel",
            version: "1.0",
            repo: "bitnami",
            digest: "test",
            created: "now",
          },
        ],
      },
    });
  });
});
