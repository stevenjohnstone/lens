/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./helm-charts.module.scss";

import React from "react";
import { computed, makeObservable } from "mobx";
import { Button } from "../button";
import { Icon } from "../icon";
import { Select, SelectOption } from "../select";
import { AddHelmRepoDialog } from "./add-helm-repo-dialog";
import { observer } from "mobx-react";
import { RemovableItem } from "./removable-item";
import { Notice } from "../+extensions/notice";
import { Spinner } from "../spinner";
import { IAsyncComputed, withInjectables } from "@ogre-tools/injectable-react";
import addHelmRepoDialogModelInjectable from "./add-helm-repo-dialog-model.injectable";
import availableHelmReposInjectable from "./available-helm-repos/available-helm-repos.injectable";
import helmReposInUseInjectable, { RemovableHelmRepo } from "./helm-repos-in-use/helm-repos-in-use.injectable";
import { matches } from "lodash/fp";
import { Notifications } from "../notifications";
import addHelmRepositoryInjectable from "./add-helm-repository/add-helm-repository.injectable";
import type { HelmRepo } from "../../../common/helm-repo";

interface Dependencies {
  availableRepos: HelmRepo[],
  reposInUse: IAsyncComputed<RemovableHelmRepo[]>
  openAddHelmRepoDialog: () => void
  addRepository: (repo: HelmRepo) => Promise<void>
}

@observer
class NonInjectedHelmCharts extends React.Component<Dependencies> {
  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed get options(): SelectOption<HelmRepo>[] {
    return this.props.availableRepos.map(repo => ({
      label: repo.name,
      value: repo,
    }));
  }

  onRepoSelect = async ({ value: repo }: SelectOption<HelmRepo>) => {
    const isAdded = !!this.props.reposInUse.value.get().find(matches({ name: repo.name }));

    if (isAdded) {
      Notifications.ok(<>Helm branch <b>{repo.name}</b> already in use</>);

      return;
    }

    this.props.addRepository(repo);
  };

  formatOptionLabel = ({ value: repo }: SelectOption<HelmRepo>) => {
    const isAdded = this.props.reposInUse.value.get().find(matches({ name: repo.name }));

    return (
      <div className="flex gaps">
        <span>{repo.name}</span>
        {isAdded && <Icon small material="check" className="box right"/>}
      </div>
    );
  };

  renderRepositories() {
    if (this.props.reposInUse.pending.get()) {
      return <div className="pt-5 relative"><Spinner center/></div>;
    }

    const repos = this.props.reposInUse.value.get();

    if (!repos.length) {
      return (
        <Notice>
          <div className="flex-grow text-center">The repositories have not been added yet</div>
        </Notice>
      );
    }

    return repos.map(repo => {
      return (
        <RemovableItem key={repo.name} onRemove={repo.remove} className="mt-3">
          <div>
            <div data-testid="repository-name" className={styles.repoName}>{repo.name}</div>
            <div className={styles.repoUrl}>{repo.url}</div>
          </div>
        </RemovableItem>
      );
    });
  }

  render() {
    return (
      <div>
        <div className="flex gaps">
          <Select id="HelmRepoSelect"
            placeholder="Repositories"
            options={this.options}
            onChange={this.onRepoSelect}
            formatOptionLabel={this.formatOptionLabel}
            controlShouldRenderValue={false}
            className="box grow"
            themeName="lens"
          />
          <Button
            primary
            label="Add Custom Helm Repo"
            onClick={this.props.openAddHelmRepoDialog}
          />
        </div>

        <AddHelmRepoDialog />

        <div className={styles.repos}>
          {this.renderRepositories()}
        </div>
      </div>
    );
  }
}

export const HelmCharts = withInjectables<Dependencies>(
  NonInjectedHelmCharts,

  {
    getPlaceholder: () => <Spinner center />,

    getProps: async (di) => ({
      availableRepos: await di.inject(availableHelmReposInjectable),
      reposInUse: di.inject(helmReposInUseInjectable),
      openAddHelmRepoDialog: di.inject(addHelmRepoDialogModelInjectable).open,
      addRepository: di.inject(addHelmRepositoryInjectable),
    }),
  },
);
