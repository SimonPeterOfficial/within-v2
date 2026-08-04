import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Hydration lock: framer-motion's useReducedMotion returns null on the
      // server but the live value on the client, so branching rendered output
      // on it causes hydration mismatches for Reduced Motion users. The
      // hydration-safe wrapper lives in src/lib/useReducedMotionSafe.ts.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "framer-motion",
              importNames: ["useReducedMotion"],
              message:
                "Import useReducedMotionSafe from @/lib/useReducedMotionSafe instead of useReducedMotion from framer-motion — the framer-motion hook returns null on the server, which breaks hydration for Reduced Motion users."
            }
          ]
        }
      ]
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
