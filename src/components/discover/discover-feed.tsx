"use client";

import { useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { IdeaWithOwner } from "@/types/app.types";
import { IdeaCard } from "@/components/discover/idea-card";
import { Button } from "@/components/ui/button";
import { X, Heart, Compass } from "lucide-react";

interface DiscoverFeedProps {
  ideas: IdeaWithOwner[];
  userId: string;
}

export function DiscoverFeed({
  ideas: initialIdeas,
  userId,
}: DiscoverFeedProps) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastAction, setLastAction] = useState<"like" | "pass" | null>(null);
  const supabase = createClient();

  const currentIdea = ideas[currentIndex];

  async function handleSwipe(direction: "left" | "right") {
    if (!currentIdea) return;

    setLastAction(direction === "right" ? "like" : "pass");

    // Record the swipe
    await supabase.from("swipes").insert({
      swiper_id: userId,
      idea_id: currentIdea.id,
      direction,
    });

    // If swiped right, create a pending match
    if (direction === "right") {
      await supabase.from("matches").insert({
        idea_id: currentIdea.id,
        idea_owner_id: currentIdea.owner_id,
        interested_user_id: userId,
        status: "pending",
      });
    }

    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => setLastAction(null), 800);
  }

  if (!currentIdea) {
    return (
      <div className="px-4 py-6 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto">
          <Compass className="h-8 w-8 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900">
            You&apos;ve seen everything!
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Check back later for new ideas, or post your own.
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-zinc-900">Discover</h1>
        <span className="text-sm text-zinc-400">
          {ideas.length - currentIndex} left
        </span>
      </div>

      {/* Action feedback overlay */}
      <AnimatePresence>
        {lastAction && (
          <motion.div
            key={lastAction}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-2xl px-6 py-3 font-bold text-white text-lg pointer-events-none ${
              lastAction === "like" ? "bg-emerald-500" : "bg-zinc-500"
            }`}
          >
            {lastAction === "like" ? "INTERESTED!" : "PASS"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card stack */}
      <div className="relative w-full" style={{ height: "480px" }}>
        {/* Next card preview */}
        {ideas[currentIndex + 1] && (
          <div
            className="absolute inset-0 scale-95 opacity-60 translate-y-2"
            style={{ zIndex: 0 }}
          >
            <IdeaCard idea={ideas[currentIndex + 1]} />
          </div>
        )}

        {/* Current card */}
        <AnimatePresence mode="wait">
          <SwipeableCard
            key={currentIdea.id}
            idea={currentIdea}
            onSwipe={handleSwipe}
          />
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex gap-6 mt-6">
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full border-2 border-zinc-200 hover:border-red-300 hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-all shadow-sm"
          onClick={() => handleSwipe("left")}
        >
          <X className="h-6 w-6" />
        </Button>
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-md active:scale-95"
          onClick={() => handleSwipe("right")}
        >
          <Heart className="h-6 w-6 text-white" />
        </Button>
      </div>
      <p className="text-xs text-zinc-400 mt-3">Swipe or tap to decide</p>
    </div>
  );
}

function SwipeableCard({
  idea,
  onSwipe,
}: {
  idea: IdeaWithOwner;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
    }
  }

  return (
    <motion.div
      style={{ x, rotate, position: "absolute", inset: 0, zIndex: 10 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      exit={{ x: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="cursor-grab active:cursor-grabbing"
    >
      {/* Like indicator */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-6 left-6 z-20 bg-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-full rotate-[-12deg] pointer-events-none"
      >
        INTERESTED
      </motion.div>
      {/* Pass indicator */}
      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute top-6 right-6 z-20 bg-zinc-500 text-white text-sm font-bold px-3 py-1 rounded-full rotate-[12deg] pointer-events-none"
      >
        PASS
      </motion.div>

      <IdeaCard idea={idea} />
    </motion.div>
  );
}
