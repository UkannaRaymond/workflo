import { createWorkspaceRoute, listWorkspaceRoute } from "./workspace";

export const router = {
  workspace: {
    list: listWorkspaceRoute,
    create: createWorkspaceRoute,
  },
};
