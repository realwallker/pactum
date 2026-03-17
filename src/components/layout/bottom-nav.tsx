"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Handshake,
  MessageCircle,
  User,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/discover", icon: Compass, label: "Discover" },
  { href: "/my-idea", icon: Lightbulb, label: "My Idea" },
  { href: "/matches", icon: Handshake, label: "Matches" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[56px]",
                active
                  ? "text-violet-600"
                  : "text-zinc-400 hover:text-zinc-600",
              )}
            >
              <Icon
                className={cn("h-5 w-5", active && "fill-violet-100")}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active ? "text-violet-600" : "text-zinc-400",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
