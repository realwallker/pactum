"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { TagInput } from "@/components/profile/tag-input";
import { Spinner } from "@/components/ui/spinner";

export default function ProfileEditPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [age, setAge] = useState(profile?.age?.toString() ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [interests, setInterests] = useState<string[]>(
    profile?.interests ?? [],
  );
  const [goals, setGoals] = useState(profile?.goals ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setAge(profile.age?.toString() ?? "");
      setCity(profile.city ?? "");
      setSkills(profile.skills ?? []);
      setInterests(profile.interests ?? []);
      setGoals(profile.goals ?? "");
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        age: age ? parseInt(age) : null,
        city: city || null,
        skills,
        interests,
        goals: goals || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      await refreshProfile();
      router.push("/profile");
    }
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-zinc-900">Edit profile</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-5 space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={13}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Skills</Label>
              <TagInput
                tags={skills}
                onChange={setSkills}
                placeholder="Add a skill..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Interests</Label>
              <TagInput
                tags={interests}
                onChange={setInterests}
                placeholder="Add an interest..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goals">Goals</Label>
              <Textarea
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={3}
                placeholder="What are you hoping to build or achieve?"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
