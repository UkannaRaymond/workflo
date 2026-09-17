import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { MemberItem } from "./MemberItem";
import { Skeleton } from "@/components/ui/skeleton";
import { usePresence } from "@/hooks/use-presence";
import { useParams } from "next/navigation";
import { User } from "@/app/schemas/realtime";

export function MemberOverview() {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery(
    orpc.workspace.member.list.queryOptions(),
  );

  const { data: workspaceData } = useQuery(orpc.workspace.list.queryOptions());
  const currentUser = workspaceData?.user
    ? ({
        id: workspaceData.user.id,
        full_name: workspaceData.user.given_name,
        email: workspaceData.user.email,
        picture: workspaceData.user.picture,
      } satisfies User)
    : null;

  const workspaceId = params.workspaceId;
  const { onlineUsers } = usePresence({
    room: `workspace-${workspaceId}`,
    currentUser: currentUser,
  });

  const members = data ?? [];
  const query = search.trim().toLowerCase();
  const filteredMembers = query
    ? members.filter((m) => {
        const name = m.full_name?.toLowerCase();
        const email = m.email?.toLowerCase();

        return name?.includes(query) || email?.includes(query);
      })
    : members;

  const onlineUserIds = useMemo(
    () => new Set(onlineUsers.map((u) => u.id)),
    [onlineUsers],
  );

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) => {
      const aIsMe = a.id === currentUser?.id;
      const bIsMe = b.id === currentUser?.id;
      if (aIsMe !== bIsMe) return aIsMe ? -1 : 1;
      if (aIsMe && bIsMe) return 0;

      const aOnline = a.id ? onlineUserIds.has(a.id) : false;
      const bOnline = b.id ? onlineUserIds.has(b.id) : false;
      if (aOnline !== bOnline) return aOnline ? -1 : 1;

      return 0;
    });
  }, [filteredMembers, currentUser?.id, onlineUserIds]);

  if (error) {
    return <h1>Error: (error.message)</h1>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={"outline"}>
          <Users />
          <span>Members</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-75">
        <div className="p=0">
          {/* Header */}
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm"></h3>
            Workspace Members
            <p className="text-xs text-muted-foreground">Members</p>
          </div>

          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-forground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8"
                placeholder="Search members..."
              />
            </div>
          </div>

          {/* Members */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
            ) : sortedMembers.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No members Found
              </p>
            ) : (
              sortedMembers.map((member) => (
                <MemberItem
                  member={member}
                  key={member.id}
                  isOnline={member.id ? onlineUserIds.has(member.id) : false}
                  isCurrentUser={member.id === currentUser?.id}
                />
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
