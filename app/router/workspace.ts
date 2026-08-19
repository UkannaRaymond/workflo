import { KindeOrganization, KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { z } from "zod";
import { base } from "../middlewares/base";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { requiredWorkspaceMiddleware } from "../middlewares/workspace";
import { workspaceSchema } from "../schemas/workspace";
import { init, Organizations } from "@kinde/management-api-js";
import { error } from "console";

export const listWorkspaceRoute = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .route({
    method: "GET",
    path: "/workspace",
    summary: "List all workspaces",
    tags: ["workspace"],
  })
  .input(z.void())
  .output(
    z.object({
      workspaces: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          avatar: z.string(),
        }),
      ),
      user: z.custom<KindeUser<Record<string, unknown>>>(),
      currentWorkspace: z.custom<KindeOrganization<Record<string, unknown>>>(),
    }),
  )
  .handler(async ({ context, errors }) => {
    const { getUserOrganizations } = getKindeServerSession();
    const userOrganizations = await getUserOrganizations();

    if (!userOrganizations) {
      throw errors.FORBIDDEN();
    }

    return {
      workspaces: userOrganizations.orgs.map((org) => ({
        id: org.code,
        name: org.name ?? "My Workspace",
        avatar: org.name?.charAt(0) ?? "M",
      })),
      user: context.user as KindeUser<Record<string, unknown>>,
      currentWorkspace: context.workspace as KindeOrganization<
        Record<string, unknown>
      >,
    };
  });

export const createWorkspaceRoute = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .route({
    method: "POST",
    path: "/workspace",
    summary: "Create a new workspaces",
    tags: ["workspace"],
  })
  .input(workspaceSchema)
  .output(
    z.object({
      orgCode: z.string(),
      workspaceName: z.string(),
    }),
  )
  .handler(async ({ context, errors, input }) => {
    init();

    let data;

    try {
      data = await Organizations.createOrganization({
        requestBody: {
          name: input.name,
        },
      });
    } catch {
      throw errors.FORBIDDEN();
    }

    if (!data.organization?.code) {
      throw errors.FORBIDDEN({
        message: "Org Code is not defined",
      });
    }
    try {
      await Organizations.addOrganizationUsers({
        orgCode: data.organization.code,
        requestBody: {
          users: [
            {
              id: context.user.id,
              roles: ["admin"],
            },
          ],
        },
      });
    } catch {
      throw errors.FORBIDDEN();
    }

    const { refreshTokens } = getKindeServerSession();

    await refreshTokens();

    return {
      orgCode: data.organization.code,
      workspaceName: input.name,
    };
  });
