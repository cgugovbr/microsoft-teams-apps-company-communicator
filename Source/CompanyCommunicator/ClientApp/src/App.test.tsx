// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { App } from "./App";

// @microsoft/teams-js requires browser crypto APIs not available in jsdom.
// Mock the entire module so import-time side effects don't throw.
jest.mock("@microsoft/teams-js", () => ({
  app: {
    initialize: jest.fn().mockResolvedValue(undefined),
    getContext: jest.fn().mockResolvedValue({
      app: { theme: "default", locale: "en-US", host: { clientType: "web" } },
      team: null,
      channel: null,
      user: null,
    }),
    registerOnThemeChangeHandler: jest.fn(),
  },
  authentication: {
    getAuthToken: jest.fn().mockResolvedValue("mock-token"),
  },
  dialog: {
    url: {
      submit: jest.fn(),
    },
  },
}));

it("App component is defined and exportable", () => {
  expect(App).toBeDefined();
});
