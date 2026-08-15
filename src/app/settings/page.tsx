import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import RequireAuth from "@/components/auth/RequireAuth";
import SettingsView from "@/components/settings/SettingsView";

export const metadata: Metadata = {
  title: "Settings — WithIn",
  description: "Tune WithIn — language, Auri, and how the world answers.",
};

export default function SettingsPage() {
  return (
    <UniverseShell preset="sanctuary">
      <RequireAuth>
        <SettingsView />
      </RequireAuth>
    </UniverseShell>
  );
}
