import React, { ReactNode } from "react";
import type { Metadata } from "next";
import { WorkspaceList } from "./_components/WorkspaceList";
import { CreateWorkspace } from "./_components/CreateWorkspace";
import { UserNav } from "./_components/UserNav";
import { orpc } from "@/lib/orpc";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const WorkspaceLayout = async ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(orpc.workspace.list.queryOptions());
  return (
    <div className="flex w-full h-screen">
      <div
        className="flex h-full w-16 flex-col items-center bg-secondary py-3
      px-2 border-r border-border"
      >
        <HydrateClient client={queryClient}>
          <WorkspaceList />
        </HydrateClient>
        <div className="mt-4">
          <CreateWorkspace />
        </div>

        <div className="mt-auto">
          <HydrateClient client={queryClient}>
            <UserNav />
          </HydrateClient>
        </div>
      </div>
      {children}
    </div>
  );
};

export default WorkspaceLayout;
