/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import createHotbarStoreInjectable from "../../common/hotbars/create-store.injectable";
import { hotbarStoreInjectionToken } from "../../common/hotbars/store-injection-token";

const hotbarStoreInjectable = getInjectable({
  instantiate: (di) => {
    const createHotbarStore = di.inject(createHotbarStoreInjectable);

    return createHotbarStore({});
  },
  injectionToken: hotbarStoreInjectionToken,
  lifecycle: lifecycleEnum.singleton,
});

export default hotbarStoreInjectable;
