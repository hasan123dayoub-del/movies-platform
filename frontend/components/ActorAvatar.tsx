import { getInitials } from "@/lib/format";

// A colored circle with the actor's initials; the color stays the same for the same name
const colors = [
  "bg-rose-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-cyan-500",
];

const sizes = {
  md: "h-14 w-14 text-lg",
  lg: "h-28 w-28 text-4xl",
};

type ActorAvatarProps = {
  name: string;
  size?: keyof typeof sizes;
};

export default function ActorAvatar({ name, size = "md" }: ActorAvatarProps) {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  const color = colors[sum % colors.length];

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${color} ${sizes[size]}`}
    >
      {getInitials(name)}
    </span>
  );
}
