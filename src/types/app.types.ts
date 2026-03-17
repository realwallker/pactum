import { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Idea = Database["public"]["Tables"]["ideas"]["Row"];
export type Swipe = Database["public"]["Tables"]["swipes"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Pactum = Database["public"]["Tables"]["pactums"]["Row"];

export type IdeaWithOwner = Idea & {
  owner: Profile;
};

export type MatchWithDetails = Match & {
  idea: Idea;
  idea_owner: Profile;
  interested_user: Profile;
  latest_message?: Message | null;
  unread_count?: number;
};

export type PactumWithMatch = Pactum & {
  match: MatchWithDetails;
};
