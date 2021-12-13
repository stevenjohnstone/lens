/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Cleans up a store that had the state related data stored
import type { MigrationDeclaration } from "../helpers";
import { catalogEntity } from "../../main/catalog-sources/general";
import { getEmptyHotbar } from "../../common/hotbar-types";
import { computeDefaultShortName } from "../../common/catalog/helpers";

export default {
  version: "5.0.0-alpha.0",
  run(store) {
    const hotbar = getEmptyHotbar("default");
    const { metadata: { uid, name, source }} = catalogEntity;

    hotbar.items[0] = {
      entity: {
        uid,
        name,
        source,
        shortName: computeDefaultShortName(name),
      },
    };

    store.set("hotbars", [hotbar]);
  },
} as MigrationDeclaration;
