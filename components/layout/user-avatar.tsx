import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

type UserAvatarProps = {
  fullName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  color?: string | null;
  className?: string;
};

export function UserAvatar({
  fullName,
  username,
  avatarUrl,
  color,
  className,
}: UserAvatarProps) {
  const display = fullName || username || "";
  return (
    <Avatar className={cn("border", className)}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={display} /> : null}
      <AvatarFallback
        style={color ? { backgroundColor: color, color: "#fff" } : undefined}
      >
        {getInitials(display)}
      </AvatarFallback>
    </Avatar>
  );
}
