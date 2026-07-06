import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 font-semibold", inverted && "text-white")}>
      <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Sparkles className="size-4" />
      </span>
      <span>Creative AI</span>
    </div>
  );
}
