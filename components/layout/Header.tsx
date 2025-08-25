"use client";
import * as React from "react";
import Link from "next/link";
import clsx from "clsx";

type HeaderProps = {
  title: string;               // e.g., "Prompt Hub"
  homeHref?: string;           // defaults to "/"
  rightSlot?: React.ReactNode; // optional override (replaces Home pill)
  className?: string;
};

const CONTAINER = "page-wrap"; // <<< matches main page exactly

export function Header({ title, homeHref = "/", rightSlot, className }: HeaderProps) {
  return (
    <header
      className={clsx(
        "w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60",
        className
      )}
    >
      <div className={clsx(CONTAINER)}>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-normal tracking-tight">{title}</h1>

          {rightSlot ?? (
            <Link
              href={homeHref}
              className="inline-flex items-center rounded-lg border px-4 py-1.5 text-sm shadow-sm transition hover:shadow"
            >
              Home
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

