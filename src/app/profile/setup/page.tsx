"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TagInput } from "@/components/profile/tag-input";
import { Spinner } from "@/components/ui/spinner";

export default function ProfileSetupPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
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
      router.push("/discover");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-600 mb-4">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Set up your profile
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Tell others what you bring to the table
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
            <CardDescription>You can always update this later</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min={13}
                    max={120}
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="San Francisco"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Your skills</Label>
                <p className="text-xs text-zinc-400">
                  What are you good at? (e.g. react, design, marketing)
                </p>
                <TagInput
                  tags={skills}
                  onChange={setSkills}
                  placeholder="Add a skill..."
                />
              </div>

              <div className="space-y-1.5">
                <Label>Your interests</Label>
                <p className="text-xs text-zinc-400">
                  What topics excite you? (e.g. fintech, climate, gaming)
                </p>
                <TagInput
                  tags={interests}
                  onChange={setInterests}
                  placeholder="Add an interest..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="goals">Your goals</Label>
                <Textarea
                  id="goals"
                  placeholder="What are you hoping to build or achieve? What kind of projects excite you?"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Setting up...
                  </>
                ) : (
                  "Complete setup"
                )}
              </Button>
              <button
                type="button"
                onClick={() => router.push("/discover")}
                className="w-full text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                Skip for now
              </button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
