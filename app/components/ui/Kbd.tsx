"use client";

interface KbdProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export default function Kbd({ children, className = "" }: Readonly<KbdProps>) {
  return (
    <kbd
      className={`inline-flex min-w-[1.5rem] items-center justify-center rounded-md border border-gray-300 bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-medium text-gray-600 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 ${className}`}
    >
      {children}
    </kbd>
  );
}
