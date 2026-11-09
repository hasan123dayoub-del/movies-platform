import type { ListRating } from "@/lib/types";

// "Members ★ 9.3 (3)" under a card's title, once at least one member has rated it
export default function MembersRatingLine({ membersRating, reviewCount }: ListRating) {
  if (membersRating == null || !reviewCount) {
    return null;
  }
  return (
    <p className="mt-2 text-xs text-zinc-500" dir="ltr">
      Members <span className="font-semibold text-amber-400">★ {membersRating.toFixed(1)}</span> ({reviewCount})
    </p>
  );
}
