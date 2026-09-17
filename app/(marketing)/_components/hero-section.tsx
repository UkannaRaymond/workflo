"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessagesSquare,
  Sparkles,
  Users,
  Bot,
  Asterisk,
  Star,
} from "lucide-react";
import Image from "next/image";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { HeroHeader } from "@/app/(marketing)/_components/header";

const LOGO_BLUE = "#0546C3";

const heroAvatarSeeds = ["Ade", "Theo", "Uche"];

const marqueeAvatarSeeds = [
  "Ade",
  "Theo",
  "Uche",
  "Victor",
  "Nwankwo",
  "Zara",
  "Idris",
  "Lola",
  "Sam",
  "Efe",
  "Milo",
  "Farah",
];

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}`;

const transitionVariants = {
  item: {
    hidden: { opacity: 0, filter: "blur(10px)", y: 10 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { type: "spring" as const, bounce: 0.3, duration: 1.2 },
    },
  },
};

const features = [
  {
    icon: MessagesSquare,
    title: "Channels that stay tidy",
    body: "One place per topic. Nothing gets lost in a single endless feed.",
  },
  {
    icon: Users,
    title: "Threads, not chaos",
    body: "Reply in context. The main channel stays readable for everyone else.",
  },
  {
    icon: Sparkles,
    title: "Reactions that feel like a nod",
    body: "A quick emoji says more than another message ever needs to.",
  },
  {
    icon: Bot,
    title: "AI that writes and recaps",
    body: "Draft a reply, or catch up on a long thread in one clean summary.",
  },
];

const channels = {
  "product-design": {
    label: "# product-design",
    messages: [
      {
        avatar: "Priya",
        name: "Uche",
        time: "10:42 AM",
        message: "Pushed the new empty states — thread has the before/after 🧵",
        reaction: "👍",
        reactions: "3",
      },
      {
        avatar: "Kenji",
        name: "Ade",
        time: "10:44 AM",
        message: "Summarized the thread with AI — saved me a scroll 🙌",
      },
      {
        avatar: "Idris",
        name: "Idris",
        time: "10:47 AM",
        message:
          "The new direction looks cleaner. I think we can ship this version.",
      },
    ],
    typing: "Idris is typing…",
  },

  general: {
    label: "# general",
    messages: [
      {
        avatar: "Victor",
        name: "Victor",
        time: "9:18 AM",
        message:
          "Morning everyone. Quick reminder about the product sync at 11.",
      },
      {
        avatar: "Zara",
        name: "Zara",
        time: "9:21 AM",
        message:
          "Added the notes from yesterday's discussion to the shared workspace.",
        reaction: "👍",
        reactions: "5",
      },
      {
        avatar: "Ade",
        name: "Ade",
        time: "9:24 AM",
        message: "Perfect. I'll review them before the sync.",
      },
    ],
    typing: "Zara is typing…",
  },

  shipped: {
    label: "# shipped",
    messages: [
      {
        avatar: "Nwankwo",
        name: "Nwankwo",
        time: "2:08 PM",
        message: "The new workspace onboarding flow is now live 🚀",
        reaction: "🎉",
        reactions: "8",
      },
      {
        avatar: "Lola",
        name: "Lola",
        time: "2:11 PM",
        message:
          "Just tested it. The transition between steps feels really smooth.",
      },
      {
        avatar: "Sam",
        name: "Sam",
        time: "2:15 PM",
        message: "Nice work. I'll keep an eye on the feedback coming in.",
      },
    ],
    typing: "Sam is typing…",
  },

  random: {
    label: "# random",
    messages: [
      {
        avatar: "Milo",
        name: "Milo",
        time: "4:32 PM",
        message: "Important question: who has the best desk setup in the team?",
        reaction: "👀",
        reactions: "4",
      },
      {
        avatar: "Farah",
        name: "Farah",
        time: "4:35 PM",
        message:
          "Definitely not me. My monitor is currently balancing on books.",
      },
      {
        avatar: "Theo",
        name: "Theo",
        time: "4:37 PM",
        message: "That officially qualifies as an engineering solution.",
      },
    ],
    typing: "Theo is typing…",
  },
};

type ChannelName = keyof typeof channels;

export default function HeroSection() {
  const [activeChannel, setActiveChannel] =
    useState<ChannelName>("product-design");

  const currentChannel = channels[activeChannel];

  return (
    <>
      <HeroHeader />

      <main className="overflow-hidden bg-[#f8f7f4] text-[#2b2a27]">
        {/* ---------- Hero ---------- */}
        <section className="relative px-6 pb-16 pt-36 md:pt-44">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(120%_60%_at_50%_0%,rgba(255,255,255,0.6)_0%,transparent_60%)]"
          />

          <div className="mx-auto max-w-4xl text-center">
            <AnimatedGroup variants={transitionVariants}>
              <div className="relative mx-auto mb-8 flex h-20 w-fit items-center justify-center">
                {/* Floating avatars */}
                <div className="absolute -left-20 top-5 hidden -rotate-6 md:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl(heroAvatarSeeds[0])}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 rounded-full border-2 border-[#f8f7f4] bg-[#efece3] shadow-[0_8px_20px_-8px_rgba(43,42,39,0.35)]"
                  />
                </div>

                <div className="absolute -right-20 top-1 hidden rotate-6 md:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl(heroAvatarSeeds[1])}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 rounded-full border-2 border-[#f8f7f4] bg-[#efece3] shadow-[0_8px_20px_-8px_rgba(43,42,39,0.35)]"
                  />
                </div>

                <div className="absolute -bottom-1 -right-7 hidden md:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl(heroAvatarSeeds[2])}
                    alt=""
                    width={38}
                    height={38}
                    className="size-10 rounded-full border-2 border-[#f8f7f4] bg-[#efece3] shadow-[0_8px_20px_-8px_rgba(43,42,39,0.3)]"
                  />
                </div>

                {/* Main avatar cluster */}
                <div className="flex items-center -space-x-3">
                  {heroAvatarSeeds.map((seed, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={seed}
                      src={avatarUrl(seed)}
                      alt=""
                      width={44}
                      height={44}
                      className={`relative size-11 rounded-full border-2 border-[#f8f7f4] bg-[#efece3] shadow-sm ${
                        index === 1 ? "z-10" : ""
                      }`}
                    />
                  ))}
                </div>

                {/* Blue asterisk */}
                <Asterisk
                  aria-hidden
                  className="absolute -right-14 -top-7 size-7 rotate-12 md:-right-28 md:-top-5 md:size-9"
                  strokeWidth={2.5}
                  style={{ color: LOGO_BLUE }}
                />
              </div>
            </AnimatedGroup>

            <TextEffect
              preset="fade-in-blur"
              speedSegment={0.3}
              as="h1"
              className="mx-auto text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
            >
              The smarter workspace
            </TextEffect>

            <TextEffect
              preset="fade-in-blur"
              speedSegment={0.3}
              as="h1"
              className="mx-auto max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-[#0546C3] md:text-7xl"
            >
              for AI-driven team collaboration
            </TextEffect>

            <TextEffect
              per="line"
              preset="fade-in-blur"
              speedSegment={0.3}
              delay={0.3}
              as="p"
              className="mx-auto mt-5 max-w-xl text-balance text-lg text-[#6b6a63]"
            >
              Channels, threads, and AI-assisted messaging — built for teams who
              want less noise and more of the conversation that matters.
            </TextEffect>

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.5,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-9 flex flex-col items-center justify-center gap-3"
            >
              {/* Primary buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <RegisterLink
                  className="rounded-full px-6 py-3 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
                  style={{ backgroundColor: LOGO_BLUE }}
                  authUrlParams={{
                    is_create_org: "true",
                    org_name: "New Workspace",
                    pricing_table_key: "organization_plans",
                  }}
                >
                  Find your workspace
                </RegisterLink>

                <Link
                  href="#product"
                  className="rounded-full bg-[#2b2a27] px-6 py-3 text-sm font-medium text-[#f8f7f4] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  See how it works
                </Link>
              </div>

              {/* GitHub button */}
              <Link
                href="https://github.com/UkannaRaymond/workflo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#e7e3da] bg-white/60 px-6 py-3 text-sm font-medium text-[#2b2a27] transition-colors hover:bg-white"
              >
                <Image
                  src="/icons/github.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                />
                <Star className="size-3.5" />
                Star on GitHub
              </Link>
            </AnimatedGroup>
          </div>
        </section>

        {/* ---------- Product preview ---------- */}
        <section id="product" className="px-6 pb-24">
          <AnimatedGroup
            variants={transitionVariants}
            className="mx-auto max-w-5xl"
          >
            <div className="overflow-hidden rounded-[28px] border border-[#e7e3da] bg-white shadow-[0_30px_60px_-30px_rgba(43,42,39,0.35)]">
              {/* Browser bar */}
              <div className="flex items-center gap-2 border-b border-[#efece3] px-5 py-3">
                <span className="size-2.5 rounded-full bg-[#e7c9b5]" />
                <span className="size-2.5 rounded-full bg-[#e8dcb0]" />
                <span className="size-2.5 rounded-full bg-[#c3ddc4]" />

                <span className="ml-3 text-xs text-[#a6a498]">
                  workflo — {currentChannel.label}
                </span>
              </div>

              <div className="grid min-h-130 grid-cols-1 sm:grid-cols-[200px_1fr]">
                {/* Channel sidebar */}
                <div className="hidden flex-col border-r border-[#efece3] p-4 sm:flex">
                  <span className="mb-3 text-xs font-medium uppercase tracking-wide text-[#c9c6ba]">
                    Channels
                  </span>

                  <div className="flex flex-col gap-1">
                    {(Object.keys(channels) as ChannelName[]).map((channel) => {
                      const isActive = activeChannel === channel;

                      return (
                        <button
                          key={channel}
                          type="button"
                          onClick={() => setActiveChannel(channel)}
                          className={`rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                            isActive
                              ? "font-medium text-[#2b2a27]"
                              : "text-[#8e8c83] hover:bg-[#f7f5ef] hover:text-[#4a4943]"
                          }`}
                          style={
                            isActive
                              ? { backgroundColor: `${LOGO_BLUE}12` }
                              : undefined
                          }
                        >
                          <span
                            style={isActive ? { color: LOGO_BLUE } : undefined}
                          >
                            #
                          </span>{" "}
                          {channel}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-auto rounded-xl border border-[#efece3] bg-[#faf9f6] p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex size-7 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: LOGO_BLUE }}
                      >
                        <Bot className="size-4" />
                      </div>

                      <div>
                        <p className="text-xs font-medium">Workflo AI</p>
                        <p className="text-[11px] text-[#a6a498]">
                          Ready to help
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile channel selector */}
                <div className="flex gap-1 overflow-x-auto border-b border-[#efece3] p-3 sm:hidden">
                  {(Object.keys(channels) as ChannelName[]).map((channel) => {
                    const isActive = activeChannel === channel;

                    return (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => setActiveChannel(channel)}
                        className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                        style={
                          isActive
                            ? {
                                backgroundColor: `${LOGO_BLUE}12`,
                                color: LOGO_BLUE,
                              }
                            : {
                                color: "#8e8c83",
                              }
                        }
                      >
                        # {channel}
                      </button>
                    );
                  })}
                </div>

                {/* Conversation */}
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-center justify-between border-b border-[#efece3] px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold">
                        {currentChannel.label}
                      </p>
                      <p className="mt-0.5 text-xs text-[#a6a498]">
                        Team conversation
                      </p>
                    </div>

                    <div className="flex -space-x-2">
                      {currentChannel.messages.slice(0, 3).map((message) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={message.avatar}
                          src={avatarUrl(message.avatar)}
                          alt=""
                          width={28}
                          height={28}
                          className="size-7 rounded-full border-2 border-white bg-[#efece3]"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-6 p-5">
                    {currentChannel.messages.map((message) => (
                      <div
                        key={`${message.name}-${message.time}`}
                        className="flex gap-3"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatarUrl(message.avatar)}
                          alt=""
                          width={36}
                          height={36}
                          className="size-9 shrink-0 rounded-full bg-[#efece3]"
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {message.name}
                            <span className="ml-1.5 font-normal text-[#a6a498]">
                              {message.time}
                            </span>
                          </p>

                          <p className="mt-1 text-sm leading-6 text-[#4a4943]">
                            {message.message}
                          </p>

                          {message.reaction && (
                            <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#e7e3da] bg-[#faf9f6] px-2.5 py-1 text-xs">
                              <span>{message.reaction}</span>
                              <span className="text-[#6b6a63]">
                                {message.reactions}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-[#a6a498]">
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: LOGO_BLUE }}
                      />
                      {currentChannel.typing}
                    </div>
                  </div>

                  {/* Message composer */}
                  <div className="border-t border-[#efece3] p-4">
                    <div className="flex items-center gap-3 rounded-xl border border-[#e7e3da] bg-[#faf9f6] px-4 py-3">
                      <span className="flex-1 text-sm text-[#b0ada3]">
                        Message {currentChannel.label}
                      </span>
                      <Sparkles
                        className="size-4"
                        style={{ color: LOGO_BLUE }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedGroup>
        </section>

        {/* ---------- Mission / features ---------- */}
        <section
          id="features"
          className="border-t border-[#efece3] bg-[#f3f1e9] px-6 py-20"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                A little less noise. A lot more focus.
              </h2>

              <p className="mt-4 text-[#6b6a63]">
                Workflo isn&apos;t trying to be everything — it&apos;s trying to
                be the place your team actually wants to check.
              </p>
            </div>

            <div id="how-it-works" className="mt-14 grid gap-6 sm:grid-cols-2">
              {features.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[#e7e3da] bg-[#f8f7f4] p-6 transition-shadow hover:shadow-[0_20px_40px_-30px_rgba(43,42,39,0.4)]"
                >
                  <div
                    className="mb-4 flex size-10 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: LOGO_BLUE }}
                  >
                    <Icon className="size-5" />
                  </div>

                  <h3 className="text-lg font-medium">{title}</h3>

                  <p className="mt-1.5 text-sm text-[#6b6a63]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Avatar wall ---------- */}
        <section className="overflow-hidden border-t border-[#efece3] bg-[#f8f7f4] py-16">
          <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.25em] text-[#a6a498]">
            Real teams. Real conversations.
          </p>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-[#f8f7f4] to-transparent" />
            <div className="absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-[#f8f7f4] to-transparent" />

            <div className="flex w-max items-center gap-6 animate-marquee">
              {[...marqueeAvatarSeeds, ...marqueeAvatarSeeds].map((seed, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${seed}-${i}`}
                  src={avatarUrl(seed)}
                  alt=""
                  width={56}
                  height={56}
                  className="size-14 shrink-0 rounded-full border border-[#e7e3da] bg-white"
                />
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="border-t border-[#efece3] bg-[#2b2a27] px-6 py-20 text-center text-[#f8f7f4]">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Your team is out there.
            <br />
            Give them a place to land.
          </h2>

          <div className="mt-8">
            <RegisterLink
              className="inline-block rounded-full bg-[#f8f7f4] px-7 py-3 text-sm font-medium text-[#2b2a27] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              authUrlParams={{
                is_create_org: "true",
                org_name: "New Workspace",
                pricing_table_key: "organization_plans",
              }}
            >
              Get started for free
            </RegisterLink>
          </div>
        </section>
      </main>
    </>
  );
}
