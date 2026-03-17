"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, CheckCircle2, Clock, Pen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Pactum, MatchWithDetails } from "@/types/app.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

interface PactumPageProps {
  matchId: string;
  match: MatchWithDetails;
  pactum: Pactum | null;
  currentUserId: string;
}

export function PactumPage({
  matchId,
  match,
  pactum: initialPactum,
  currentUserId,
}: PactumPageProps) {
  const router = useRouter();
  const supabase = createClient();

  const [pactum, setPactum] = useState<Pactum | null>(initialPactum);
  const [showForm, setShowForm] = useState(!initialPactum);

  // Form state
  const [title, setTitle] = useState(
    pactum?.title ?? `${match.idea?.title} Collaboration`,
  );
  const [description, setDescription] = useState(pactum?.description ?? "");
  const [ownerRole, setOwnerRole] = useState(pactum?.owner_role ?? "");
  const [collaboratorRole, setCollaboratorRole] = useState(
    pactum?.collaborator_role ?? "",
  );
  const [terms, setTerms] = useState(pactum?.terms ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isOwner = match.idea_owner_id === currentUserId;
  const ownerName = match.idea_owner.full_name;
  const collaboratorName = match.interested_user.full_name;

  const ownerSigned = !!pactum?.owner_signed_at;
  const collaboratorSigned = !!pactum?.collaborator_signed_at;
  const isSigned = ownerSigned && collaboratorSigned;

  const mySigned = isOwner ? ownerSigned : collaboratorSigned;
  const otherSigned = isOwner ? collaboratorSigned : ownerSigned;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase
      .from("pactums")
      .insert({
        match_id: matchId,
        title,
        description,
        owner_role: ownerRole,
        collaborator_role: collaboratorRole,
        terms,
        created_by: currentUserId,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setPactum(data);
      setShowForm(false);
      setLoading(false);
    }
  }

  async function handleSign() {
    if (!pactum) return;
    setLoading(true);
    const field = isOwner ? "owner_signed_at" : "collaborator_signed_at";

    const { data, error } = await supabase
      .from("pactums")
      .update({
        [field]: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", pactum.id)
      .select()
      .single();

    if (!error && data) setPactum(data);
    setLoading(false);
  }

  return (
    <div className="px-4 py-6 space-y-4 pb-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push(`/chat/${matchId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Pactum</h1>
          <p className="text-xs text-zinc-500">Collaboration agreement</p>
        </div>
        {pactum && !showForm && !isSigned && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowForm(true)}
            className="ml-auto"
          >
            <Pen className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        )}
      </div>

      {/* Info about the idea */}
      <Card className="bg-violet-50 border-violet-100">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-600 flex-shrink-0" />
            <p className="text-sm text-violet-800 font-medium truncate">
              {match.idea?.title}
            </p>
          </div>
          <div className="flex gap-3 mt-1.5 text-xs text-violet-600">
            <span>
              Owner: <strong>{ownerName}</strong>
            </span>
            <span>
              Collaborator: <strong>{collaboratorName}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {showForm ? (
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}

          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Agreement title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize what you're building together and the goals of this collaboration..."
                  rows={3}
                  required
                />
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label>{ownerName}&apos;s role (Owner)</Label>
                <Textarea
                  value={ownerRole}
                  onChange={(e) => setOwnerRole(e.target.value)}
                  placeholder={`What will ${ownerName} be responsible for?`}
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>{collaboratorName}&apos;s role (Collaborator)</Label>
                <Textarea
                  value={collaboratorRole}
                  onChange={(e) => setCollaboratorRole(e.target.value)}
                  placeholder={`What will ${collaboratorName} be responsible for?`}
                  rows={2}
                  required
                />
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label>Terms & conditions</Label>
                <Textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Ownership split, timeline, communication expectations, IP rights, exit conditions..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                {pactum && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save agreement"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : pactum ? (
        <div className="space-y-4">
          {/* Signing status */}
          <Card className={isSigned ? "border-emerald-200 bg-emerald-50" : ""}>
            <CardHeader>
              <CardTitle className="text-sm">Signatures</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">
                  {ownerName} (Owner)
                </span>
                {ownerSigned ? (
                  <Badge variant="success">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Signed
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">
                  {collaboratorName}
                </span>
                {collaboratorSigned ? (
                  <Badge variant="success">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Signed
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
              {isSigned && (
                <p className="text-xs text-emerald-700 font-medium pt-1">
                  Both parties have signed — the pactum is active!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Agreement content */}
          <Card>
            <CardHeader>
              <CardTitle>{pactum.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <p className="text-sm text-zinc-600">{pactum.description}</p>

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">
                    {ownerName}&apos;s role
                  </p>
                  <p className="text-sm text-zinc-700">{pactum.owner_role}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">
                    {collaboratorName}&apos;s role
                  </p>
                  <p className="text-sm text-zinc-700">
                    {pactum.collaborator_role}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">
                  Terms
                </p>
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                  {pactum.terms}
                </p>
              </div>
            </CardContent>
          </Card>

          {!mySigned && !isSigned && (
            <Button onClick={handleSign} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Signing...
                </>
              ) : (
                "Sign this agreement"
              )}
            </Button>
          )}

          {mySigned && !otherSigned && (
            <p className="text-center text-sm text-zinc-500">
              Waiting for {isOwner ? collaboratorName : ownerName} to sign...
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
