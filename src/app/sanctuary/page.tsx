import { redirect } from "next/navigation";

/** /sanctuary is the home sanctuary — one route, one name. */
export default function SanctuaryPage() {
  redirect("/home");
}
