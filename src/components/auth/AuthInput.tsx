"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

type AuthInputProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  toggle?: boolean;
  /** Inline validation message — turns the field rose and announces the error */
  error?: string;
};

export default function AuthInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  toggle = false,
  error
}: AuthInputProps) {
  const [revealed, setRevealed] = useState(false);
  const inputType = type === "password" && revealed ? "text" : type;

  return (
    <div className="text-left">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-[#44435e]">
        {label}
      </label>
      <span className="relative block">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`crystal-focus w-full rounded-full bg-white/[0.55] px-5 py-3 pr-14 text-sm text-[#232136] placeholder-[#8b8aa0] outline-none backdrop-blur transition focus:bg-white/[0.72] ${
            error
              ? "ring-1 ring-rose-400/70"
              : "ring-1 ring-white/70 hover:ring-white/90"
          }`}
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), var(--depth-low)" }}
        />
        {toggle && (
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            {revealed ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          </button>
        )}
      </span>
      {error && (
        <motion.p
          id={`${id}-error`}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-2 px-3 text-xs text-rose-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
