import Link from "next/link";

export function Header() {
  return (
    <div className="space-x-8">
      <Link
        href="/"
        className="text-lg font-semibold tracking-tight decoration-violet-500 decoration-2 underline-offset-2 outline-none hover:underline focus:underline"
      >
        About
      </Link>
      <Link
        href="/notes"
        className="text-lg font-semibold tracking-tight decoration-violet-500 decoration-2 underline-offset-2 outline-none hover:underline focus:underline"
      >
        Notes
      </Link>
    </div>
  );
}
