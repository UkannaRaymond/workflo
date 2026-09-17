import arcjet, { slidingWindow } from "@/lib/arcjet";
import { base } from "../base";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { ArcjetNextRequest } from "@arcjet/next";

// Reactions are frequent, low-risk taps — not message content — so they
// get a roomier budget than message create/update/delete, and skip
// sensitiveInfo scanning entirely (there's no free text to scan).
const buildReactionArcjet = () =>
  arcjet.withRule(
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 120,
    }),
  );

export const reactionSecurityMiddleware = base
  .$context<{
    request?: Request | ArcjetNextRequest;
    user: KindeUser<Record<string, unknown>>;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const { request } = context;
    if (!request) {
      return next();
    }
    const decision = await buildReactionArcjet().protect(request, {
      userId: context.user.id,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw errors.RATE_LIMITED({
          message: "You're reacting a bit fast — give it a second.",
        });
      }

      throw errors.FORBIDDEN({
        message: "Request Blocked!",
      });
    }

    return next();
  });
