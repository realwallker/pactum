import { IdeaWithOwner } from "@/types/app.types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";

interface IdeaCardProps {
  idea: IdeaWithOwner;
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const owner = idea.owner;

  return (
    <div className="w-full h-full bg-white rounded-3xl shadow-lg border border-zinc-100 overflow-hidden flex flex-col select-none">
      {/* Color accent header */}
      <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-500" />

      <div className="flex-1 p-5 flex flex-col gap-4 overflow-hidden">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900 leading-snug">
            {idea.title}
          </h2>
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-600 leading-relaxed flex-1 overflow-hidden line-clamp-6">
          {idea.description}
        </p>

        {/* Required skills */}
        {idea.required_skills?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Looking for
            </p>
            <div className="flex flex-wrap gap-1.5">
              {idea.required_skills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Owner info */}
      <div className="border-t border-zinc-100 px-5 py-3 flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={owner?.avatar_url ?? undefined} />
          <AvatarFallback className="text-xs">
            {owner?.full_name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-800 truncate">
            {owner?.full_name}
          </p>
          {owner?.city && (
            <p className="text-xs text-zinc-400 flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {owner.city}
            </p>
          )}
        </div>
        {owner?.skills && owner.skills.length > 0 && (
          <div className="flex gap-1 flex-shrink-0">
            {owner.skills.slice(0, 2).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-[10px]">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
