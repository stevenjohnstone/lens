/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getHelmRepositories } from "./get-helm-repositories";
import addHelmRepositoryInjectable from "../add-helm-repository/add-helm-repository.injectable";
import updateHelmRepositoriesInjectable from "../update-helm-repositories/update-helm-repositories.injectable";
import getHelmEnvInjectable from "../../get-helm-env/get-helm-env.injectable";
import readHelmConfigInjectable from "./read-helm-config/read-helm-config.injectable";
import { once } from "lodash/fp";

const getHelmRepositoriesInjectable = getInjectable({
  id: "get-helm-repositories",

  instantiate: (di) =>
    getHelmRepositories({
      readHelmConfig: di.inject(readHelmConfigInjectable),
      addHelmRepository: di.inject(addHelmRepositoryInjectable),
      getHelmEnv: once(di.inject(getHelmEnvInjectable)),
      updateHelmRepositories: once(di.inject(updateHelmRepositoriesInjectable)),
    }),
});

export default getHelmRepositoriesInjectable;
