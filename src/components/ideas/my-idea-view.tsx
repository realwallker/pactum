"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Users, Edit, Trash2, Lightbulb } from "lucide-react";
import { Idea } from "@/types/app.types";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IdeaForm } from "@/components/ideas/idea-form";

interface MyIdeaViewProps {
  activeIdea: Idea | null;
  pendingCount: number;
}

export function MyIdeaView({ activeIdea, pendingCount }: MyIdeaViewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDeactivate() {
    if (
      !activeIdea ||
      !confirm("Deactivate your idea? It will no longer appear in discovery.")
    )
      return;
    setDeleting(true);
    await supabase
      .from("ideas")
      .update({ is_active: false })
      .eq("id", activeIdea.id);
    router.refresh();
  }

  if (showForm || (editMode && activeIdea)) {
    return (
      <div className="px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setShowForm(false);
              setEditMode(false);
            }}
          >
            <span className="text-lg">←</span>
          </Button>
          <h1 className="text-xl font-bold">
            {editMode ? "Edit idea" : "Create idea"}
          </h1>
        </div>
        <IdeaForm
          idea={editMode ? (activeIdea ?? undefined) : undefined}
          onSuccess={() => {
            setShowForm(false);
            setEditMode(false);
            router.refresh();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditMode(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900">My Idea</h1>
        {!activeIdea && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New idea
          </Button>
        )}
      </div>

      {activeIdea ? (
        <>
          {/* Pending interests banner */}
          {pendingCount > 0 && (
            <Link href="/my-idea/interests">
              <Card className="bg-violet-600 border-0 cursor-pointer hover:bg-violet-700 transition-colors">
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Users className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      {pendingCount} new{" "}
                      {pendingCount === 1 ? "person" : "people"} interested
                    </span>
                  </div>
                  <span className="text-white/80 text-sm">Review →</span>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Active idea card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg leading-snug">
                  {activeIdea.title}
                </CardTitle>
                <Badge variant="success">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <p className="text-sm text-zinc-600">{activeIdea.description}</p>
              {activeIdea.required_skills?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    Looking for
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeIdea.required_skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="flex-1"
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href="/my-idea/interests">
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    Interests
                    {pendingCount > 0 && (
                      <span className="ml-1.5 bg-violet-600 text-white text-xs rounded-full px-1.5 py-0.5">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleDeactivate}
                  disabled={deleting}
                  className="text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-dashed border-2 border-zinc-200">
          <CardContent className="py-12 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Share your idea</h3>
              <p className="text-sm text-zinc-500 mt-1">
                Post your idea and attract talented collaborators
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create idea
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
