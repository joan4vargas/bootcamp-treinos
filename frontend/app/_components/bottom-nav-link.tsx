import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface BottomNavLinkProps {
  href?: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
}

export function BottomNavLink({
  href,
  icon: Icon,
  label,
  isActive,
}: BottomNavLinkProps) {
  const iconClassName = cn(
    "size-6",
    isActive ? "text-foreground" : "text-icon-inactive",
  );

  if (!href) {
    return (
      <span
        aria-label={label}
        aria-disabled
        className="flex size-12 items-center justify-center opacity-50"
      >
        <Icon className={iconClassName} />
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      className="flex size-12 items-center justify-center"
    >
      <Icon className={iconClassName} />
    </Link>
  );
}
