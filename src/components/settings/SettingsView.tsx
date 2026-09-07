"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import GlassCard from "@/components/ui/GlassCard";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import { getMood, moods } from "@/lib/mood";
import { useEnvironment } from "@/lib/environment";
import { memory } from "@/lib/memory";
import {
  DEFAULT_AURI_PREFERENCES,
  getAuriPreferences,
  saveAuriPreferences,
  type AuriPreferences
} from "@/lib/auri";
import {
  DEFAULT_SOUND_PREFERENCES,
  getSoundPreferences,
  saveSoundPreferences,
  playInterfaceTick,
  type SoundPreferences
} from "@/lib/within-sound";
import { copy } from "@/lib/navigation";

/** Language options — the UI is prepared but not translated yet. */
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
  { code: "sw", label: "Kiswahili" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" }
];

/** Auri's presence options — kept quiet, never clinical. These toggle real
 * behavior: AuriOrb (whispers), AuriPanel (greetings), AuriSuggestion
 * (discovery moments) each read the saved preferences. */
const AURI_PREFERENCES: { id: keyof AuriPreferences; label: string; detail: string }[] = [
  { id: "whispers", label: "Resting whispers", detail: "Small lines under the owl while she rests." },
  { id: "greetings", label: "Time greetings", detail: "Good morning, good evening — the room says hello." },
  { id: "suggestions", label: "Discovery moments", detail: "Let Auri set out something she thinks you'll like." }
];

const LANG_KEY = "language";

/** Sound controls — the sonic identity, entirely in the user's hands. */
const SOUND_PREFERENCES: { id: keyof SoundPreferences; label: string; detail: string }[] = [
  { id: "master", label: "Sound", detail: "The master switch — WithIn stays silent until you invite it." },
  { id: "cinematic", label: "Cinematic sounds", detail: "The ident and the world's opening moments." },
  { id: "interface", label: "Interface sounds", detail: "Small confirmations — a tick when something lands." },
  { id: "music", label: "Music", detail: "Reserved for the music rooms as they grow." },
  { id: "auriVoice", label: "Auri's voice", detail: "A place held for her voice — nothing speaks yet." }
];

function SettingRow({
  label,
  detail,
  children
}: {
  label: string;
  detail?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-md">
        <p className="text-sm font-semibold text-white">{label}</p>
        {detail && <p className="mt-1 text-xs leading-relaxed text-gray-500">{detail}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/**
 * Settings — how the world answers. Default mood, Auri's presence, language
 * (prepared, not translated), all kept locally and honestly labeled.
 */
export default function SettingsView() {
  const { moodId, setMood } = useEnvironment();
  const [prefs, setPrefs] = useState<AuriPreferences>(DEFAULT_AURI_PREFERENCES);
  const [sound, setSound] = useState<SoundPreferences>(DEFAULT_SOUND_PREFERENCES);
  const [language, setLanguage] = useState("en");

  // Hydration-safe: preferences resolve after mount.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPrefs(getAuriPreferences());
      setSound(getSoundPreferences());
      setLanguage(memory.get<string>("preferences", LANG_KEY) ?? "en");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const togglePref = (id: keyof AuriPreferences) => {
    const next = { ...prefs, [id]: !prefs[id] };
    setPrefs(next);
    saveAuriPreferences(next);
  };

  const toggleSound = (id: keyof SoundPreferences) => {
    const next = { ...sound, [id]: !sound[id] };
    setSound(next);
    saveSoundPreferences(next);
    // Master turning on is the gesture browsers require — confirm it audibly.
    if (id === "master" && next.master) playInterfaceTick();
  };

  const changeLanguage = (code: string) => {
    setLanguage(code);
    memory.set("preferences", LANG_KEY, code);
  };

  // The default mood works through the shared mood engine — applyMood persists
  // the choice itself, so no separate preference key is needed.
  const changeMood = (id: string | null) => setMood(id);

  return (
    <>
      <PageHero
        eyebrow={copy.settings.eyebrow}
        title={copy.settings.title}
        subtitle={copy.settings.subtitle}
      />

      <Container className="pb-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-8">
            {/* Default mood */}
            <GlassCard tone="strong" className="p-7">
              <div className="flex items-center gap-4">
                <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl">
                  {getMood(moodId)?.emoji ?? "✦"}
                </span>
                <div>
                  <h2 className="font-display text-xl font-medium tracking-[-0.02em]">
                    Your default mood
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    The light the sanctuary wakes in when you arrive.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {moods.map((mood) => {
                  const active = moodId === mood.id;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => changeMood(active ? null : mood.id)}
                      aria-pressed={active}
                      className={`rounded-full border px-4 py-2 text-sm transition duration-300 ${
                        active
                          ? "border-[rgba(var(--mood-rgb),0.6)] bg-[rgba(var(--mood-rgb),0.15)] text-white"
                          : "border-white/10 bg-white/5 text-gray-300 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      <span className="mr-1.5" aria-hidden>{mood.emoji}</span>
                      {mood.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => changeMood(null)}
                  aria-pressed={moodId === null}
                  className={`rounded-full border px-4 py-2 text-sm transition duration-300 ${
                    moodId === null
                      ? "border-[rgba(var(--mood-rgb),0.6)] bg-[rgba(var(--mood-rgb),0.15)] text-white"
                      : "border-white/10 bg-white/5 text-gray-300 hover:border-white/25 hover:text-white"
                  }`}
                >
                  ✦ Brand purple
                </button>
              </div>
            </GlassCard>

            {/* Auri preferences */}
            <GlassCard tone="strong" className="p-7">
              <div className="flex items-center gap-4">
                <AuriOwl size={44} particles={false} state="curious" />
                <div>
                  <h2 className="font-display text-xl font-medium tracking-[-0.02em]">
                    Auri&apos;s presence
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    What she shares, and how much room she takes.
                  </p>
                </div>
              </div>
              <div className="mt-4 divide-y divide-white/5">
                {AURI_PREFERENCES.map((pref) => {
                  const enabled = prefs[pref.id];
                  return (
                    <div key={pref.id} className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-200">{pref.label}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{pref.detail}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        aria-label={pref.label}
                        onClick={() => togglePref(pref.id)}
                        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-300 ${
                          enabled
                            ? "border-emerald-400/40 bg-emerald-400/20"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <motion.span
                          aria-hidden
                          animate={{ x: enabled ? 22 : 2 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full ${
                            enabled ? "bg-emerald-300" : "bg-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Sound — the sonic identity, opt-in and honest */}
            <GlassCard tone="strong" className="p-7">
              <div className="flex items-center gap-4">
                <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl">
                  ◍
                </span>
                <div>
                  <h2 className="font-display text-xl font-medium tracking-[-0.02em]">
                    Sound
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    WithIn has a voice made of light — it stays quiet until you ask for it.
                  </p>
                </div>
              </div>
              <div className="mt-4 divide-y divide-white/5">
                {SOUND_PREFERENCES.map((pref) => {
                  const enabled = sound[pref.id];
                  return (
                    <div key={pref.id} className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-200">{pref.label}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{pref.detail}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        aria-label={pref.label}
                        onClick={() => toggleSound(pref.id)}
                        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-300 ${
                          enabled
                            ? "border-emerald-400/40 bg-emerald-400/20"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <motion.span
                          aria-hidden
                          animate={{ x: enabled ? 22 : 2 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full ${
                            enabled ? "bg-emerald-300" : "bg-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Language — prepared, not translated */}
            <GlassCard tone="strong" className="p-7">
              <h2 className="font-display text-xl font-medium tracking-[-0.02em]">Language</h2>
              <p className="mt-1 text-xs text-gray-500">
                The interface is built to survive longer text — full translation arrives with the
                i18n pass.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => {
                  const active = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => changeLanguage(lang.code)}
                      aria-pressed={active}
                      className={`rounded-full border px-4 py-2 text-sm transition duration-300 ${
                        active
                          ? "border-[rgba(var(--mood-rgb),0.6)] bg-[rgba(var(--mood-rgb),0.15)] text-white"
                          : "border-white/10 bg-white/5 text-gray-300 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {language !== "en" && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-5 rounded-card border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-gray-400"
                  >
                    {language === "fr" && "Bien noté — la traduction complète arrive bientôt. L'interface restera fidèle à l'anglais pour l'instant."}
                    {language === "es" && "Anotado — la traducción completa llegará pronto. La interfaz seguirá en inglés por ahora."}
                    {language === "ar" && "تم الحفظ — الترجمة الكاملة ستأتي قريبًا. الواجهة ستبقى بالإنجليزية حاليًا."}
                    {language === "sw" && "Imehifadhiwa — tafsiri kamili itakuja karibuni. Kiolesura kitabaki kwa Kiingereza kwa sasa."}
                    {language === "de" && "Notiert — die vollständige Übersetzung folgt bald. Die Oberfläche bleibt vorerst auf Englisch."}
                    {language === "ja" && "承知しました — 完全な翻訳は近日中に追加されます。現在は英語のままです。"}
                    {language === "ko" && "확인했습니다 — 전체 번역은 곧 제공됩니다. 지금은 영어로 유지됩니다."}
                    {(language === "en" || (!["fr", "es", "ar", "sw", "de", "ja", "ko"].includes(language))) && "Noted — full translation arrives soon. The interface stays in English for now."}
                  </motion.p>
                )}
              </AnimatePresence>
            </GlassCard>
          </div>

          {/* Side note */}
          <div className="lg:pt-2">
            <GlassCard tone="soft" className="p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400">
                Your data
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Everything on this page is kept in this browser — nothing leaves your device.
                When the account system arrives, these preferences follow you.
              </p>
            </GlassCard>
          </div>
        </div>

        {/* Refined settings rows — kept as one more quiet shelf */}
        <GlassCard tone="soft" className="mt-8 divide-y divide-white/5 px-7">
          <SettingRow label="Reduce motion" detail="Honors your system setting — WithIn goes still.">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300">
              Follows system
            </span>
          </SettingRow>
          <SettingRow label="Theme" detail="The world can be bright or deep — your choice.">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300">
              Via the theme toggle
            </span>
          </SettingRow>
          <SettingRow label="Notifications" detail="Nothing is delivered yet — when real notifications exist, this governs them.">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300">
              Not live
            </span>
          </SettingRow>
          <SettingRow label="Privacy" detail="Everything lives in this browser — no accounts store your data remotely today.">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300">
              Local only
            </span>
          </SettingRow>
        </GlassCard>
      </Container>
    </>
  );
}
