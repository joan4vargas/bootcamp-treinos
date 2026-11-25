import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  linkLabel?: string;
  linkHref?: string;
}

export function SectionHeader({
  title,
  linkLabel,
  linkHref,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg leading-[1.4] font-semibold">{title}</h2>
      {linkLabel && linkHref && (
        <Link href={linkHref} className="text-primary text-xs leading-[1.4]">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
