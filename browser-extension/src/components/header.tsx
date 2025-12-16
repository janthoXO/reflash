import React from "react";
import { cn } from "~lib/utils";

interface HeaderProps {
  children?: React.ReactNode;
  title?: string | React.ReactNode;
  prefix?: React.ReactNode[];
  suffix?: React.ReactNode[];
  className?: string;
}

export default function Header({
  children,
  title,
  prefix,
  suffix,
  className,
}: HeaderProps) {
  return (
    <div className={cn(`flex justify-between items-center gap-2 pb-2`, className)}>
      <div className="flex flex-1 items-center gap-2 min-w-0">
        {prefix}
        {title && typeof title === "string" ? (
          <h1 className="text-2xl font-bold flex-1 min-w-0 truncate">{title}</h1>
        ) : (
          <div className="flex-1">{title}</div>
        )}
        {children}
      </div>
      {suffix && <div className="flex gap-2">{suffix}</div>}
    </div>
  );
}
