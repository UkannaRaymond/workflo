import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { client } from "@/lib/orpc";
import { Cloud } from "lucide-react";
import { redirect } from "next/navigation";
import { CreateNewChannel } from "./_components/CreateNewChannel";

interface iAppProps {
  params: Promise<{ workspaceId: string }>;
}

const WorkspaceIdPage = async ({ params }: iAppProps) => {
  const { workspaceId } = await params;

  const { channels } = await client.channel.list();

  if (channels.length > 0) {
    return redirect(`/workspace/${workspaceId}/channel/${channels[0].id}`);
  }
  return (
    <div className="p-16 flex flex-1">
      <Empty className="h-full bg-muted/30">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Cloud />
          </EmptyMedia>
          <EmptyTitle>No channel yet!</EmptyTitle>
          <EmptyDescription>
            Create your first channel to get started!
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="max-w-xs mx-auto">
          <CreateNewChannel />
        </EmptyContent>
      </Empty>
    </div>
  );
};

export default WorkspaceIdPage;
