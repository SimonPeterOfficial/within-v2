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
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-300">
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
          className={`w-full rounded-full border bg-white/5 px-5 py-3 pr-14 text-sm text-white placeholder-gray-500 outline-none backdrop-blur transition focus:bg-white/10 ${
            error
              ? "border-rose-400/60 focus:border-rose-400/70"
              : "border-white/10 focus:border-emerald-400/50"
          }`}
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
          className="mt-2 px-3 text-xs text-rose-300"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
