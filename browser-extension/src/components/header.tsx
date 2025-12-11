import React from "react";
import { cn } from "~lib/utils";

interface HeaderProps {
  children?: React.ReactNode;
  title?: string;
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
    <header className={cn(`flex justify-between pb-2`, className)}>
      <div className="flex gap-2">
        {prefix}
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
        {children}
      </div>
      {suffix && <div className="flex gap-2">{suffix}</div>}
    </header>
  );
}
