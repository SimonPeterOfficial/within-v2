import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import RequireAuth from "@/components/auth/RequireAuth";
import ProfileView from "@/components/profile/ProfileView";

export const metadata: Metadata = {
  title: "Profile — WithIn",
  description: "Your corner of WithIn — saved content, likes, and your journey.",
};

export default function ProfilePage() {
  return (
    <UniverseShell preset="sanctuary">
      <RequireAuth>
        <ProfileView />
      </RequireAuth>
    </UniverseShell>
  );
}
