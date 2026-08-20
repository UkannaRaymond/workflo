import { createChannel, listChannels } from "./channel";
import { createWorkspaceRoute, listWorkspaceRoute } from "./workspace";

export const router = {
  workspace: {
    list: listWorkspaceRoute,
    create: createWorkspaceRoute,
  },

  channel: {
    create: createChannel,
    list: listChannels,
  },
};
