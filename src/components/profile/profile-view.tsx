"use client";

import Link from "next/link";
import { MapPin, Target, Edit, LogOut } from "lucide-react";
import { Profile, Idea } from "@/types/app.types";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileViewProps {
  profile: Profile;
  activeIdea?: Idea | null;
  isOwnProfile?: boolean;
}

export function ProfileView({
  profile,
  activeIdea,
  isOwnProfile,
}: ProfileViewProps) {
  const { signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900">Profile</h1>
        {isOwnProfile && (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href="/profile/edit">
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-lg">
                {profile.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-zinc-900 truncate">
                {profile.full_name}
              </h2>
              <div className="flex flex-wrap gap-2 mt-1 text-sm text-zinc-500">
                {profile.age && <span>{profile.age} years</span>}
                {profile.city && (
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          {profile.goals && (
            <div className="mt-4 flex gap-2">
              <Target className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-600">{profile.goals}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      {profile.skills?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-500 uppercase tracking-wide">
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="default">
                {skill}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Interests */}
      {profile.interests?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-500 uppercase tracking-wide">
              Interests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex flex-wrap gap-1.5">
            {profile.interests.map((interest) => (
              <Badge key={interest} variant="secondary">
                {interest}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Idea */}
      {activeIdea && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-500 uppercase tracking-wide">
              Active Idea
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <h3 className="font-semibold text-zinc-900">{activeIdea.title}</h3>
            <p className="text-sm text-zinc-600 line-clamp-2">
              {activeIdea.description}
            </p>
            {activeIdea.required_skills?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {activeIdea.required_skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isOwnProfile && !activeIdea && (
        <Card className="border-dashed border-violet-200 bg-violet-50/50">
          <CardContent className="py-5 text-center">
            <p className="text-sm text-zinc-500 mb-3">
              You don&apos;t have an active idea yet
            </p>
            <Button size="sm" asChild>
              <Link href="/my-idea">Create your idea</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
