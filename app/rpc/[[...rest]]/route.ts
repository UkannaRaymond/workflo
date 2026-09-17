import { RPCHandler } from "@orpc/server/fetch";
import { NextRequest } from "next/server";
import { onError } from "@orpc/server";
import { router } from "@/app/router";

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

async function handleRequest(request: NextRequest) {
  // Arcjet's Next adapter needs a real NextRequest (it reads nextUrl/cookies),
  // and it clones the body itself before scanning. Give it its own body stream
  // so oRPC can still read the original.
  const arcjetRequest = new NextRequest(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.clone().body,
  });

  const { response } = await handler.handle(request, {
    prefix: "/rpc",
    context: {
      request: arcjetRequest,
    },
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
