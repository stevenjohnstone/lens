/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./add-helm-repo-dialog.scss";

import React from "react";
import type { FileFilter } from "electron";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Dialog } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Input } from "../input";
import { Checkbox } from "../checkbox";
import { Button } from "../button";
import { systemName, isUrl, isPath } from "../input/input_validators";
import { SubTitle } from "../layout/sub-title";
import { Icon } from "../icon";
import { Notifications } from "../notifications";
import { requestOpenFilePickingDialog } from "../../ipc";
import { withInjectables } from "@ogre-tools/injectable-react";
import addHelmRepoDialogModelInjectable from "./add-helm-repo-dialog-model.injectable";
import type { AddHelmRepoDialogModel } from "./add-helm-repo-dialog-model";
import addHelmRepositoryInjectable from "./add-helm-repository/add-helm-repository.injectable";
import type { HelmRepo } from "../../../common/helm-repo";

interface Dependencies {
  addHelmRepository: (repo: HelmRepo) => Promise<void>
  model: AddHelmRepoDialogModel
}

enum FileType {
  CaFile = "caFile",
  KeyFile = "keyFile",
  CertFile = "certFile",
}

@observer
class NonInjectedAddHelmRepoDialog extends React.Component<Dependencies> {
  private emptyRepo = { name: "", url: "", username: "", password: "", insecureSkipTlsVerify: false, caFile:"", keyFile: "", certFile: "" };

  private keyExtensions = ["key", "keystore", "jks", "p12", "pfx", "pem"];
  private certExtensions = ["crt", "cer", "ca-bundle", "p7b", "p7c", "p7s", "p12", "pfx", "pem"];

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  @observable helmRepo : HelmRepo = this.emptyRepo;
  @observable showOptions = false;

  close = () => {
    this.props.model.close();
    this.helmRepo = this.emptyRepo;
    this.showOptions = false;
  };

  setFilepath(type: FileType, value: string) {
    this.helmRepo[type] = value;
  }

  getFilePath(type: FileType) : string {
    return this.helmRepo[type];
  }

  async selectFileDialog(type: FileType, fileFilter: FileFilter) {
    const { canceled, filePaths } = await requestOpenFilePickingDialog({
      defaultPath: this.getFilePath(type),
      properties: ["openFile", "showHiddenFiles"],
      message: `Select file`,
      buttonLabel: `Use file`,
      filters: [
        fileFilter,
        { name: "Any", extensions: ["*"] },
      ],
    });

    if (!canceled && filePaths.length) {
      this.setFilepath(type, filePaths[0]);
    }
  }

  async addCustomRepo() {
    try {
      this.props.addHelmRepository(this.helmRepo);
      Notifications.ok(<>Helm repository <b>{this.helmRepo.name}</b> has added</>);
      this.close();
    } catch (err) {
      Notifications.error(<>Adding helm branch <b>{this.helmRepo.name}</b> has failed: {String(err)}</>);
    }
  }

  renderFileInput(placeholder:string, fileType:FileType, fileExtensions:string[]){
    return(
      <div className="flex gaps align-center">
        <Input
          placeholder={placeholder}
          validators={isPath}
          className="box grow"
          value={this.getFilePath(fileType)}
          onChange={v => this.setFilepath(fileType, v)}
        />
        <Icon
          material="folder"
          onClick={() => this.selectFileDialog(fileType, { name: placeholder, extensions: fileExtensions })}
          tooltip="Browse"
        />
      </div>);
  }

  renderOptions() {
    return (
      <>
        <SubTitle title="Security settings" />
        <Checkbox
          label="Skip TLS certificate checks for the repository"
          value={this.helmRepo.insecureSkipTlsVerify}
          onChange={v => this.helmRepo.insecureSkipTlsVerify = v}
        />
        {this.renderFileInput(`Key file`, FileType.KeyFile, this.keyExtensions)}
        {this.renderFileInput(`Ca file`, FileType.CaFile, this.certExtensions)}
        {this.renderFileInput(`Certificate file`, FileType.CertFile, this.certExtensions)}
        <SubTitle title="Chart Repository Credentials" />
        <Input
          placeholder="Username"
          value={this.helmRepo.username} onChange= {v => this.helmRepo.username = v}
        />
        <Input
          type="password"
          placeholder="Password"
          value={this.helmRepo.password} onChange={v => this.helmRepo.password = v}
        />
      </>);
  }

  render() {
    const { ...dialogProps } = this.props;

    const header = <h5>Add custom Helm Repo</h5>;

    return (
      <Dialog
        {...dialogProps}
        className="AddHelmRepoDialog"
        isOpen={this.props.model.isOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel="Add" next={() => this.addCustomRepo()}>
            <div className="flex column gaps">
              <Input
                autoFocus required
                placeholder="Helm repo name"
                trim
                validators={systemName}
                value={this.helmRepo.name} onChange={v => this.helmRepo.name = v}
              />
              <Input
                required
                placeholder="URL"
                validators={isUrl}
                value={this.helmRepo.url} onChange={v => this.helmRepo.url = v}
              />
              <Button plain className="accordion" onClick={() => this.showOptions = !this.showOptions} >
                More
                <Icon
                  small
                  tooltip="More"
                  material={this.showOptions ? "remove" : "add"}
                />
              </Button>
              {this.showOptions && this.renderOptions()}
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}

export const AddHelmRepoDialog = withInjectables<Dependencies>(
  NonInjectedAddHelmRepoDialog,

  {
    getProps: (di, props) => ({
      addHelmRepository: di.inject(addHelmRepositoryInjectable),
      model: di.inject(addHelmRepoDialogModelInjectable),
      ...props,
    }),
  },
);
