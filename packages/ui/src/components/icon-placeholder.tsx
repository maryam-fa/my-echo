import React from "react";

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
  tabler,
  hugeicons,
  phosphor,
  remixicon,
  size,
  className,
}: IconPlaceholderProps) => {
  // This determines which icon set to use based on what prop you passed
  const iconName = lucide || tabler || hugeicons || phosphor || remixicon;

  return (
    <div className={className} style={{ fontSize: size === "icon-sm" ? "14px" : "16px" }}>
      {/* Note: This is a placeholder shell. 
          To render real icons, you'll eventually need to map 'iconName' 
          to actual components from lucide-react, @phosphor-icons/react, etc.
      */}
      <span>{iconName}</span> 
    </div>
  );
};