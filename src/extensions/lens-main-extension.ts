/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { LensExtension } from "./lens-extension";
import { catalogEntityRegistry } from "../main/catalog";
import type { CatalogEntity } from "../common/catalog";
import type { IObservableArray } from "mobx";
import type { MenuRegistration } from "../main/menu/menu-registration";
import type { TrayMenuRegistration } from "../main/tray/tray-menu-registration";
import { extensionDependencies, LensMainExtensionDependencies } from "./lens-extension-set-dependencies";

export class LensMainExtension extends LensExtension<LensMainExtensionDependencies> {
  appMenus: MenuRegistration[] = [];
  trayMenus: TrayMenuRegistration[] = [];

  navigate(pageId?: string, params?: Record<string, any>, frameId?: number): void;
  /**
   * @deprecated this function isn't really async, it just returns a resolved promise
   */
  navigate(pageId?: string, params?: Record<string, any>, frameId?: number): Promise<void>;
  navigate(pageId?: string, params?: Record<string, any>, frameId?: number): Promise<void> {
    this[extensionDependencies].navigateExtension(this.id, pageId, params, frameId);

    return Promise.resolve();
  }

  addCatalogSource(id: string, source: IObservableArray<CatalogEntity>) {
    catalogEntityRegistry.addObservableSource(`${this.name}:${id}`, source);
  }

  removeCatalogSource(id: string) {
    catalogEntityRegistry.removeSource(`${this.name}:${id}`);
  }
}
