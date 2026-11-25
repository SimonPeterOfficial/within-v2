import { CINEMATIC_LOADER_ENABLED } from "@/components/loader/loader-config";

export const dynamic = "force-dynamic";

/**
 * Feature flags in WithIn are build-time constants, not a runtime service.
 * This page reports their real values so nobody is misled by a toggle that
 * cannot actually change anything.
 */
const FLAGS = [
  {
    id: "cinematic-loader",
    name: "Cinematic entrance loader",
    description: "Gates the landing entrance behind the cinematic loader sequence.",
    enabled: CINEMATIC_LOADER_ENABLED,
  },
];

export default function FeaturesPage() {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70">
        Feature Flags
      </p>
      <h2 className="mb-2 font-display text-2xl font-medium tracking-[-0.02em] text-white">
        Feature Flags
      </h2>
      <p className="mb-8 text-sm text-gray-500">
        Flags are build-time constants in this repository — there is no runtime flag
        service. Values shown here are read directly from the source.
      </p>

      <div className="space-y-2">
        {FLAGS.map((flag) => (
          <div
            key={flag.id}
            className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                flag.enabled ? "bg-emerald-400" : "bg-gray-600"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{flag.name}</p>
              <p className="mt-0.5 text-[12px] text-gray-500">{flag.description}</p>
            </div>
            <span
              className={`text-[11px] font-medium ${flag.enabled ? "text-emerald-400" : "text-gray-500"}`}
            >
              {flag.enabled ? "ON" : "OFF"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
