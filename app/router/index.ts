import { createChannel, getChannel, listChannels } from "./channel";
import { inviteMember, listMembers } from "./member";
import { createMessage, listMessages, updateMessage } from "./message";
import { createWorkspaceRoute, listWorkspaceRoute } from "./workspace";

export const router = {
  workspace: {
    list: listWorkspaceRoute,
    create: createWorkspaceRoute,
    member: {
      list: listMembers,
      invite: inviteMember,
    },
  },

  channel: {
    create: createChannel,
    list: listChannels,
    get: getChannel,
  },
  message: {
    create: createMessage,
    list: listMessages,
    update: updateMessage,
  },
};
