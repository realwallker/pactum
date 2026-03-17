import Link from "next/link";
import { MessageCircle, Handshake } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MatchWithDetails {
  id: string;
  idea_id: string;
  idea_owner_id: string;
  interested_user_id: string;
  status: string;
  created_at: string;
  idea: { title: string; description: string };
  idea_owner: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    skills: string[];
  };
  interested_user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    skills: string[];
  };
}

interface MatchesListProps {
  matches: MatchWithDetails[];
  currentUserId: string;
}

export function MatchesList({ matches, currentUserId }: MatchesListProps) {
  return (
    <div className="px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold text-zinc-900">Matches</h1>

      {matches.length === 0 ? (
        <Card className="border-dashed border-2 border-zinc-200">
          <CardContent className="py-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Handshake className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900">No matches yet</p>
              <p className="text-sm text-zinc-500 mt-1">
                Discover ideas and swipe right, or share your own idea and
                accept interested collaborators.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/discover">Start discovering</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => {
            const isOwner = match.idea_owner_id === currentUserId;
            const otherPerson = isOwner
              ? match.interested_user
              : match.idea_owner;

            return (
              <Card
                key={match.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="py-4 space-y-3">
                  {/* Idea context */}
                  <div>
                    <Badge variant="default" className="text-[10px]">
                      {isOwner ? "Your idea" : "Their idea"}
                    </Badge>
                    <p className="font-semibold text-zinc-900 mt-1 line-clamp-1">
                      {match.idea?.title}
                    </p>
                  </div>

                  {/* Person */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherPerson?.avatar_url ?? undefined} />
                      <AvatarFallback>
                        {otherPerson?.full_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-zinc-800">
                        {otherPerson?.full_name}
                      </p>
                      {otherPerson?.skills?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {otherPerson.skills.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/chat/${match.id}`}>
                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                        Chat
                      </Link>
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
