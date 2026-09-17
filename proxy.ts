import arcjet, { createMiddleware, detectBot } from "@arcjet/next";
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextProxy, NextRequest, NextResponse } from "next/server";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:PREVIEW",
        "CATEGORY:MONITOR",
        "CATEGORY:WEBHOOK",
      ],
    }),
  ],
});

type KindeAuthData = {
  token?: {
    org_code?: string;
    claims?: {
      org_code?: string;
    };
  };
  user?: {
    org_code?: string;
  };
};

async function existingKindeMiddleWare(req: NextRequest) {
  /*
   * Kinde's authentication data isn't part of NextRequest's
   * default TypeScript type, so define the properties we need.
   */
  const authenticatedReq = req as NextRequest & {
    kindeAuth?: KindeAuthData;
  };

  const url = req.nextUrl;

  const orgCode =
    authenticatedReq.kindeAuth?.user?.org_code ||
    authenticatedReq.kindeAuth?.token?.org_code ||
    authenticatedReq.kindeAuth?.token?.claims?.org_code;

  if (
    url.pathname.startsWith("/workspace") &&
    !url.pathname.includes(orgCode || "")
  ) {
    url.pathname = `/workspace/${orgCode}`;

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export default createMiddleware(
  aj,
  withAuth(existingKindeMiddleWare, {
    publicPaths: ["/", "/api/uploadthing"],
  }) as NextProxy,
);

// export const config = {
//   // matcher tells Next.js which routes to run the middleware on.
//   // This runs the middleware on all routes except for static assets.
//   matcher: ["/((?!_next/static|_next/image|favicon.ico|/rpc).*)"],
// };

export const config = {
  // matcher tells Next.js which routes to run the middleware on.
  // This runs the middleware on all routes except for static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|api/uploadthing|rpc).*)",
  ],
};
