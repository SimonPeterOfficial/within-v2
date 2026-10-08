"use client";

import { useState, type FormEvent } from "react";
import { MOCK_SETTINGS } from "@/lib/admin/data";

const SECTIONS = ["Platform", "Content", "Moderation", "Community", "Auri", "Notifications", "Appearance"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string | boolean>>(() => {
    const initial: Record<string, string | boolean> = {};
    MOCK_SETTINGS.forEach((s) => { initial[s.key] = s.value; });
    return initial;
  });

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70 mb-2">
        Settings
      </p>
      <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-white mb-8">
        Platform Settings
      </h2>

      <SecuritySection />

      <div className="space-y-8">
        {SECTIONS.map((section) => {
          const sectionSettings = MOCK_SETTINGS.filter((s) => s.section === section);
          return (
            <div key={section} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">{section}</h3>
              <div className="space-y-4">
                {sectionSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between gap-4">
                    <label className="text-sm text-gray-300">{setting.label}</label>
                    {setting.type === "toggle" ? (
                      <button
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, [setting.key]: !s[setting.key] }))}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
                          settings[setting.key] ? "bg-emerald-500" : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            settings[setting.key] ? "translate-x-[22px]" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    ) : setting.type === "select" ? (
                      <select
                        value={settings[setting.key] as string}
                        onChange={(e) => setSettings((s) => ({ ...s, [setting.key]: e.target.value }))}
                        className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-gray-300 outline-none"
                      >
                        {setting.options?.map((opt) => <option key={opt} value={opt} className="capitalize">{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={settings[setting.key] as string}
                        onChange={(e) => setSettings((s) => ({ ...s, [setting.key]: e.target.value }))}
                        className="w-48 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-white outline-none transition focus:border-white/[0.15]"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (newPassword.length < 8) { setStatus("New password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setStatus("New passwords do not match."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setStatus("Admin password updated.");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        setStatus(data.error ?? "Could not update the password.");
      }
    } catch {
      setStatus("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 mb-8">
      <h3 className="text-sm font-semibold text-white mb-4">Security</h3>
      <form onSubmit={changePassword} className="space-y-3 max-w-sm">
        <label className="block text-sm text-gray-300">
          Current password
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
            className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none" />
        </label>
        <label className="block text-sm text-gray-300">
          New password
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8}
            className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none" />
        </label>
        <label className="block text-sm text-gray-300">
          Confirm new password
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
            className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none" />
        </label>
        <button type="submit" disabled={busy}
          className="rounded-lg bg-white/[0.08] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.14] disabled:opacity-50">
          {busy ? "Updating…" : "Change admin password"}
        </button>
        {status && <p className="text-sm text-emerald-300">{status}</p>}
      </form>
    </div>
  );
}
