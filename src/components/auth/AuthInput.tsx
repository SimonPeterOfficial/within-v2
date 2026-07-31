"use client";

import { useState } from "react";

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
  toggle = false
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
          className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 pr-14 text-sm text-white placeholder-gray-500 outline-none backdrop-blur transition focus:border-emerald-400/50 focus:bg-white/10"
        />
        {toggle && (
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-medium text-gray-400 transition hover:text-white"
          >
            {revealed ? "Hide" : "Show"}
          </button>
        )}
      </span>
    </div>
  );
}
