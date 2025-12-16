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
    <div className={cn(`flex justify-between items-center pb-2`, className)}>
      <div className="flex flex-1 items-center gap-2">
        {prefix}
        {title && typeof title === "string" ? (
          <h1 className="text-2xl font-bold">{title}</h1>
        ) : (
          title
        )}
        {children}
      </div>
      {suffix && <div className="flex gap-2">{suffix}</div>}
    </div>
  );
}
