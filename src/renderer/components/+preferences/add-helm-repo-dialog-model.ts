/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { observable, makeObservable, action } from "mobx";

export class AddHelmRepoDialogModel {
  isOpen = false;

  constructor() {
    makeObservable(this, {
      isOpen: observable,
      open: action,
      close: action,
    });
  }

  open = () => {
    this.isOpen = true;
  };

  close = () => {
    this.isOpen = false;
  };
}
