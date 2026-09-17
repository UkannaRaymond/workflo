import arcjet, { sensitiveInfo, slidingWindow } from "@/lib/arcjet";
import { base } from "../base";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { ArcjetNextRequest } from "@arcjet/next";

const buildStandardArcjet = () =>
  arcjet
    .withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: 2,
      }),
    )
    .withRule(
      sensitiveInfo({
        mode: "LIVE",
        deny: ["PHONE_NUMBER", "CREDIT_CARD_NUMBER"],
      }),
    );

export const heavyWriteSecurityMiddleware = base
  .$context<{
    request?: Request | ArcjetNextRequest;
    user: KindeUser<Record<string, unknown>>;
  }>()
  .middleware(async ({ context, next, errors }) => {
    const { request } = context;
    if (!request) {
      return next();
    }
    const decision = await buildStandardArcjet().protect(request, {
      userId: context.user.id,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw errors.RATE_LIMITED({
          message: "Too many impactful changes, please slow down.",
        });
      }

      if (decision.reason.isSensitiveInfo()) {
        throw errors.BAD_REQUEST({
          message:
            "Sensitive information detected. Please remove PII (e.g., credit card details, phone numbers.",
        });
      }

      throw errors.FORBIDDEN({
        message: "Request Blocked!",
      });
    }

    return next();
  });
