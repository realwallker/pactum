"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";
import { Idea } from "@/types/app.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { TagInput } from "@/components/profile/tag-input";
import { Spinner } from "@/components/ui/spinner";

interface IdeaFormProps {
  idea?: Idea;
  onSuccess: () => void;
  onCancel: () => void;
}

export function IdeaForm({ idea, onSuccess, onCancel }: IdeaFormProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [title, setTitle] = useState(idea?.title ?? "");
  const [description, setDescription] = useState(idea?.description ?? "");
  const [requiredSkills, setRequiredSkills] = useState<string[]>(
    idea?.required_skills ?? [],
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    if (idea) {
      // Update existing
      const { error } = await supabase
        .from("ideas")
        .update({
          title,
          description,
          required_skills: requiredSkills,
          updated_at: new Date().toISOString(),
        })
        .eq("id", idea.id);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      // Create new
      const { error } = await supabase.from("ideas").insert({
        owner_id: user.id,
        title,
        description,
        required_skills: requiredSkills,
      });

      if (error) {
        if (error.code === "23505") {
          setError("You already have an active idea. Deactivate it first.");
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }
    }

    onSuccess();
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="title">Idea title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI-powered meal planner"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea, what problem it solves, and what you're trying to build..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Skills you&apos;re looking for</Label>
            <p className="text-xs text-zinc-400">
              What expertise do you need from a collaborator?
            </p>
            <TagInput
              tags={requiredSkills}
              onChange={setRequiredSkills}
              placeholder="e.g. react, machine learning..."
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {idea ? "Saving..." : "Publishing..."}
                </>
              ) : idea ? (
                "Save changes"
              ) : (
                "Publish idea"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
