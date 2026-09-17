"use client";

import { User } from "@/app/schemas/realtime";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePresence } from "@/hooks/use-presence";
import { getAvatar } from "@/lib/get-avatar";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export function WorkspaceMembersList() {
  const {
    data: { members },
  } = useSuspenseQuery(orpc.channel.list.queryOptions());

  const { data: workspaceData } = useQuery(orpc.workspace.list.queryOptions());
  // const currentUser = useMemo(() => {
  //   if (!workspaceData?.user) return null;

  //   return {
  //     id: workspaceData.user.id,
  //     full_name: workspaceData.user.given_name,
  //     email: workspaceData.user.email,
  //     picture: workspaceData.user.picture,
  //   } satisfies User;
  // }, [workspaceData?.user]);
  const currentUser = workspaceData?.user
    ? ({
        id: workspaceData.user.id,
        full_name: workspaceData.user.given_name,
        email: workspaceData.user.email,
        picture: workspaceData.user.picture,
      } satisfies User)
    : null;

  const params = useParams();
  const workspaceId = params.workspaceId;
  const { onlineUsers } = usePresence({
    room: `workspace-${workspaceId}`,
    currentUser: currentUser,
  });

  const onlineUserIds = useMemo(
    () => new Set(onlineUsers.map((u) => u.id)),
    [onlineUsers],
  );

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const aIsMe = a.id === currentUser?.id;
      const bIsMe = b.id === currentUser?.id;
      if (aIsMe !== bIsMe) return aIsMe ? -1 : 1;
      if (aIsMe && bIsMe) return 0;

      const aOnline = a.id ? onlineUserIds.has(a.id) : false;
      const bOnline = b.id ? onlineUserIds.has(b.id) : false;
      if (aOnline !== bOnline) return aOnline ? -1 : 1;

      return 0;
    });
  }, [members, currentUser?.id, onlineUserIds]);

  return (
    <div className="space-y-0.5 py-1">
      {sortedMembers.map((member) => (
        <div
          key={member.id}
          className="px-3 py-2 hover:bg-accent cursor-pointer transition-colors flex items-center space-x-3"
        >
          <div className="relative">
            <Avatar className="size-8 rounded-full overflow-hidden">
              <Image
                src={getAvatar(member.picture ?? null, member.email!)}
                alt="User Image"
                className="object-cover"
                fill
                sizes="32px"
              />
              <AvatarFallback>
                {member.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Online/Offline status indicator */}
            <div
              className={cn(
                "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-violet-500",
                member.id && onlineUserIds.has(member.id)
                  ? "bg-green-500"
                  : "bg-gray-400",
              )}
            ></div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {member.id === currentUser?.id ? "You" : member.full_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {member.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
