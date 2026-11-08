import Image from "next/image";
import type { Actor } from "@/lib/types";
import { getInitials } from "@/lib/format";

// Used when an actor has no photo: a colored circle with their initials,
// and the same name always gets the same color
const colors = [
  "bg-rose-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-cyan-500",
];

const sizes = {
  sm: { box: "h-10 w-10 text-sm", pixels: "40px" },
  md: { box: "h-14 w-14 text-lg", pixels: "56px" },
  lg: { box: "h-28 w-28 text-4xl sm:h-36 sm:w-36", pixels: "144px" },
};

type ActorAvatarProps = {
  actor: Pick<Actor, "name" | "photoUrl">;
  size?: keyof typeof sizes;
};

export default function ActorAvatar({ actor, size = "md" }: ActorAvatarProps) {
  const { box, pixels } = sizes[size];

  if (actor.photoUrl) {
    return (
      <span
        className={`relative shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-2 ring-white/10 ${box}`}
      >
        <Image
          src={actor.photoUrl}
          alt={actor.name}
          fill
          sizes={pixels}
          className="object-cover object-top"
        />
      </span>
    );
  }

  const sum = [...actor.name].reduce((total, char) => total + char.charCodeAt(0), 0);
  const color = colors[sum % colors.length];

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${color} ${box}`}
    >
      {getInitials(actor.name)}
    </span>
  );
}
