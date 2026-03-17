"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Check, X } from "lucide-react";
import { Idea } from "@/types/app.types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PendingMatch {
  id: string;
  idea_id: string;
  interested_user_id: string;
  status: string;
  created_at: string;
  interested_user: {
    id: string;
    full_name: string;
    age: number | null;
    city: string | null;
    skills: string[];
    interests: string[];
    goals: string | null;
    avatar_url: string | null;
  };
}

interface InterestsInboxProps {
  idea: Idea;
  pendingMatches: PendingMatch[];
}

export function InterestsInbox({
  idea,
  pendingMatches: initialMatches,
}: InterestsInboxProps) {
  const router = useRouter();
  const supabase = createClient();
  const [matches, setMatches] = useState(initialMatches);
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleDecision(
    matchId: string,
    action: "matched" | "declined",
  ) {
    setProcessing(matchId);
    await supabase
      .from("matches")
      .update({ status: action, updated_at: new Date().toISOString() })
      .eq("id", matchId);

    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    setProcessing(null);
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Interested people</h1>
          <p className="text-xs text-zinc-500 truncate">For: {idea.title}</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <Card className="border-dashed border-2 border-zinc-200">
          <CardContent className="py-12 text-center">
            <p className="text-zinc-500 font-medium">No pending interests</p>
            <p className="text-sm text-zinc-400 mt-1">
              When someone swipes right on your idea, they&apos;ll appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">
            {matches.length} {matches.length === 1 ? "person" : "people"} want
            to collaborate
          </p>
          {matches.map((match) => {
            const person = match.interested_user;
            return (
              <Card key={match.id} className="overflow-hidden">
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={person.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {person.full_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-zinc-900">
                        {person.full_name}
                      </h3>
                      <div className="flex gap-2 text-xs text-zinc-500 mt-0.5">
                        {person.age && <span>{person.age}y</span>}
                        {person.city && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {person.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {person.goals && (
                    <p className="text-sm text-zinc-600 line-clamp-2">
                      {person.goals}
                    </p>
                  )}

                  {person.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {person.skills.slice(0, 6).map((skill) => (
                        <Badge key={skill} variant="default">
                          {skill}
                        </Badge>
                      ))}
                      {person.skills.length > 6 && (
                        <Badge variant="secondary">
                          +{person.skills.length - 6}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => handleDecision(match.id, "declined")}
                      disabled={processing === match.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Pass
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => handleDecision(match.id, "matched")}
                      disabled={processing === match.id}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
