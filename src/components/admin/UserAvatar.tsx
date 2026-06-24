import React from "react";
import Image from "next/image";

interface UserAvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function UserAvatar({
  name,
  imageUrl,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const sizeMap = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-10 h-10 text-xs",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";

  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 font-bold overflow-hidden shrink-0 select-none border border-purple-200/20 ${sizeMap[size]} ${className}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name || "User"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
