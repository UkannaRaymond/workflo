#!/usr/bin/env node
/**
 * Workflo realtime latency & concurrency benchmark
 * ---------------------------------------------------
 * Measures end-to-end WebSocket broadcast latency and connection
 * reliability against the `Chat` Durable Object (realtime/index.ts),
 * using the same wire protocol as ChannelRealtimeProvider.tsx.
 *
 * Usage:
 *   node realtime-benchmark.mjs \
 *     --url ws://127.0.0.1:8787 \      # base host, no path
 *     --room bench-room-1 \            # any string, becomes channel-<room>
 *     --connections 20 \               # concurrent virtual clients
 *     --messages 50                    # messages sent by the "sender" client
 *
 * Local dev example:
 *   node realtime-benchmark.mjs --url ws://127.0.0.1:8787 --connections 20 --messages 50
 *
 * Prod example (run from a separate machine/region for a real "remote" number):
 *   node realtime-benchmark.mjs --url wss://workflo-chat-realtime.<your-subdomain>.workers.dev \
 *     --connections 20 --messages 50
 *
 * Requires: `npm install ws` (or `pnpm add ws` / `yarn add ws`)
 */

import { WebSocket } from "ws";
import { randomUUID } from "node:crypto";

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).reduce((acc, arg, i, arr) => {
      if (arg.startsWith("--")) acc.push([arg.slice(2), arr[i + 1]]);
      return acc;
    }, []),
  );
  return {
    url: args.url ?? "ws://127.0.0.1:8787",
    room: args.room ?? `bench-${Date.now()}`,
    connections: Number(args.connections ?? 20),
    messages: Number(args.messages ?? 50),
    connectTimeoutMs: Number(args.connectTimeoutMs ?? 5000),
    messageTimeoutMs: Number(args.messageTimeoutMs ?? 3000),
    connectStaggerMs: Number(args.connectStaggerMs ?? 0),
  };
}

function roomUrl(base, room) {
  // partyserver's default routing convention: /parties/<party>/<room>
  // "party" matches the exported class name lowercased ("Chat" -> "chat").
  return `${base.replace(/\/$/, "")}/parties/chat/${room}`;
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

async function openConnection(url, connectTimeoutMs) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const timer = setTimeout(() => {
      ws.terminate();
      reject(new Error("connect timeout"));
    }, connectTimeoutMs);

    ws.once("open", () => {
      clearTimeout(timer);
      resolve(ws);
    });
    ws.once("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function main() {
  const opts = parseArgs();
  const url = roomUrl(opts.url, opts.room);

  console.log(`Connecting ${opts.connections} clients to ${url} ...`);

  const sockets = [];
  let failedConnections = 0;

  const openOne = () => openConnection(url, opts.connectTimeoutMs);

  let openResults;
  if (opts.connectStaggerMs > 0) {
    // Open sequentially with a delay, mimicking users trickling into a room
    // instead of a connection-storm that queues behind itself on the DO.
    openResults = [];
    for (let i = 0; i < opts.connections; i++) {
      openResults.push(await openOne().then(
        (v) => ({ status: "fulfilled", value: v }),
        (e) => ({ status: "rejected", reason: e }),
      ));
      if (i < opts.connections - 1) {
        await new Promise((r) => setTimeout(r, opts.connectStaggerMs));
      }
    }
  } else {
    openResults = await Promise.allSettled(
      Array.from({ length: opts.connections }, openOne),
    );
  }

  for (const result of openResults) {
    if (result.status === "fulfilled") {
      sockets.push(result.value);
    } else {
      failedConnections++;
      console.warn("Connection failed:", result.reason?.message ?? result.reason);
    }
  }

  if (sockets.length < 2) {
    console.error("Need at least 2 successful connections (1 sender + 1 receiver). Aborting.");
    sockets.forEach((s) => s.close());
    process.exit(1);
  }

  const [sender, ...receivers] = sockets;

  // Pending receipts: messageId -> { sentAt, remaining: Set<receiverIndex> }
  const pending = new Map();
  const latencies = [];
  let droppedDeliveries = 0;

  receivers.forEach((ws, i) => {
    ws.on("message", (raw) => {
      let parsed;
      try {
        parsed = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (parsed?.type !== "message:created") return;
      const content = parsed.payload?.message?.content ?? "";
      if (!content.startsWith("bench|")) return;

      const [, id, sentAtStr] = content.split("|");
      const sentAt = Number(sentAtStr);
      const now = Date.now();

      const entry = pending.get(id);
      if (entry) {
        latencies.push(now - sentAt);
        entry.remaining.delete(i);
      } else {
        latencies.push(now - sentAt);
      }
    });

    ws.on("error", () => failedConnections++);
  });

  // Give receivers a moment to settle before sending.
  await new Promise((r) => setTimeout(r, 300));

  console.log(`Sending ${opts.messages} messages from 1 sender to ${receivers.length} receivers...`);

  for (let seq = 0; seq < opts.messages; seq++) {
    const id = randomUUID();
    const sentAt = Date.now();
    pending.set(id, { sentAt, remaining: new Set(receivers.map((_, i) => i)) });

    const event = {
      type: "message:created",
      payload: {
        message: {
          id,
          content: `bench|${id}|${sentAt}`,
          createdAt: new Date(sentAt).toISOString(),
          updatedAt: new Date(sentAt).toISOString(),
          authorId: "bench-sender",
          channelId: opts.room,
          reactions: [],
        },
      },
    };

    sender.send(JSON.stringify(event));
    await new Promise((r) => setTimeout(r, 20)); // small stagger, avoid coalescing
  }

  const expectedDeliveries = opts.messages * receivers.length;

  // Wait for deliveries to land (or time out).
  const deadline = Date.now() + opts.messageTimeoutMs;
  while (latencies.length < expectedDeliveries && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 50));
  }
  droppedDeliveries = expectedDeliveries - latencies.length;

  sockets.forEach((s) => s.close());

  const sorted = [...latencies].sort((a, b) => a - b);
  const median = percentile(sorted, 50);
  const p95 = percentile(sorted, 95);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  console.log("\n=== Results ===");
  console.log(`Connections attempted:  ${opts.connections}`);
  console.log(`Connections succeeded:  ${sockets.length}`);
  console.log(`Connections failed:     ${failedConnections}`);
  console.log(`Messages sent:          ${opts.messages}`);
  console.log(`Deliveries expected:    ${expectedDeliveries}`);
  console.log(`Deliveries received:    ${latencies.length}`);
  console.log(`Deliveries dropped:     ${droppedDeliveries}`);
  console.log(`Latency min/median/p95/max (ms): ${min ?? "-"} / ${median ?? "-"} / ${p95 ?? "-"} / ${max ?? "-"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
