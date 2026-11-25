import { notFound } from "next/navigation";

/**
 * The visual review room is a development tool. In production builds the
 * route resolves as a 404 so it can never ship to visitors.
 */
export default function QaLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return <>{children}</>;
}
