import React from "react";
import * as LucideIcons from "lucide-react";

interface IconPlaceholderProps {
  lucide?: string;
  tabler?: string;
  hugeicons?: string;
  phosphor?: string;
  remixicon?: string;
  size?: string;
  className?: string;
}

export const IconPlaceholder = ({
  lucide,
  size,
  className,
}: IconPlaceholderProps) => {
  if (lucide) {
    const LucideIcon = LucideIcons[lucide as keyof typeof LucideIcons] as React.ElementType;
    if (LucideIcon) {
      return <LucideIcon className={className} size={size === "icon-sm" ? 14 : 16} />;
    }
  }

  return null; // Icon nahi mila toh kuch nahi dikhao
};