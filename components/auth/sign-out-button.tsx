"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button, type ButtonProps } from "@/components/ui/button";

export function SignOutButton({
  variant = "ghost",
  size = "sm",
  showIcon = true,
  className,
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  showIcon?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Déconnexion impossible", { description: error.message });
      setPending(false);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={pending}
      className={className}
    >
      {pending ? (
        <Loader2 className="animate-spin" />
      ) : showIcon ? (
        <LogOut />
      ) : null}
      Déconnexion
    </Button>
  );
}
