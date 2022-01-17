/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from "react";
import mockFs from "mock-fs";
import { fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { BottomBar } from "./bottom-bar";
import { StatusBarRegistry } from "../../../extensions/registries";
import hotbarManagerInjectable from "../../../common/hotbar-store.injectable";
import { HotbarSwitchCommand } from "../hotbar/hotbar-switch-command";
import { ActiveHotbarName } from "./active-hotbar-name";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import { DiRender, renderFor } from "../test-utils/renderFor";
import type { DependencyInjectionContainer } from "@ogre-tools/injectable";
import commandOverlayInjectable from "../command-palette/command-overlay.injectable";
import { getEmptyHotbar } from "../../../common/hotbar-types";


jest.mock("electron", () => ({
  app: {
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
  },
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    off: jest.fn(),
    send: jest.fn(),
  },
}));

const foobarHotbar = getEmptyHotbar("foobar");

describe("<BottomBar />", () => {
  let di: DependencyInjectionContainer;
  let render: DiRender;

  beforeEach(async () => {
    const mockOpts = {
      "tmp": {
        "test-store.json": JSON.stringify({}),
      },
    };

    di = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs(mockOpts);

    render = renderFor(di);

    di.override(hotbarManagerInjectable, () => ({
      getActive: () => foobarHotbar,
    } as any));

    await di.runSetups();

    StatusBarRegistry.createInstance();
  });

  afterEach(() => {
    StatusBarRegistry.resetInstance();
    mockFs.restore();
  });

  it("renders w/o errors", () => {
    const { container } = render(<BottomBar />);

    expect(container).toBeInstanceOf(HTMLElement);
  });

  it.each([
    undefined,
    "hello",
    6,
    null,
    [],
    [{}],
    {},
  ])("renders w/o errors when .getItems() returns not type compliant (%p)", val => {
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => val);
    expect(() => render(<BottomBar />)).not.toThrow();
  });

  it("renders items [{item: React.ReactNode}] (4.0.0-rc.1)", () => {
    const testId = "testId";
    const text = "heee";

    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [
      { item: <span data-testid={testId} >{text}</span> },
    ]);
    const { getByTestId } = render(<BottomBar />);

    expect(getByTestId(testId)).toHaveTextContent(text);
  });

  it("renders items [{item: () => React.ReactNode}] (4.0.0-rc.1+)", () => {
    const testId = "testId";
    const text = "heee";

    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [
      { item: () => <span data-testid={testId} >{text}</span> },
    ]);
    const { getByTestId } = render(<BottomBar />);

    expect(getByTestId(testId)).toHaveTextContent(text);
  });

  it("shows active hotbar name", () => {
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [
      { item: () => <ActiveHotbarName/> },
    ]);
    const { getByTestId } = render(<BottomBar />);

    expect(getByTestId("current-hotbar-name")).toHaveTextContent("foobar");
  });

  it("opens command palette on click", () => {
    const mockOpen = jest.fn();

    di.override(commandOverlayInjectable, () => ({
      open: mockOpen,
    }) as any);

    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [
      { item: () => <ActiveHotbarName/> },
    ]);
    const { getByTestId } = render(<BottomBar />);
    const activeHotbar = getByTestId("current-hotbar-name");

    fireEvent.click(activeHotbar);


    expect(mockOpen).toHaveBeenCalledWith(<HotbarSwitchCommand />);
  });

  it("sort positioned items properly", () => {
    StatusBarRegistry.getInstance().getItems = jest.fn().mockImplementationOnce(() => [
      {
        components: {
          Item: () => <div data-testid="sortedElem">right</div>,
        },
      },
      {
        components: {
          Item: () => <div data-testid="sortedElem">right</div>,
          position: "right",
        },
      },
      {
        components: {
          Item: () => <div data-testid="sortedElem">left</div>,
          position: "left",
        },
      },
      {
        components: {
          Item: () => <div data-testid="sortedElem">left</div>,
          position: "left",
        },
      },
    ]);

    const { getAllByTestId } = render(<BottomBar />);
    const elems = getAllByTestId("sortedElem");
    const positions = elems.map(elem => elem.textContent);

    expect(positions).toEqual(["left", "left", "right", "right"]);
  });
});
