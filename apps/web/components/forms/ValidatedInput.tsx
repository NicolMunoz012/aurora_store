"use client";
// =============================================================================
// components/forms/ValidatedInput.tsx
// Reusable input components with built-in validation and error display
// =============================================================================

import { type InputHTMLAttributes } from "react";

interface ValidatedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  error?: string;
  helperText?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function ValidatedInput({
  label,
  error,
  helperText,
  onChange,
  required = false,
  ...inputProps
}: ValidatedInputProps) {
  return (
    <div>
      <label htmlFor={inputProps.id} className="mb-1 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...inputProps}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-gray-200 focus:border-cerise-400 focus:ring-2 focus:ring-cerise-100"
        } ${inputProps.disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
      />
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

interface ValidatedSelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label: string;
  error?: string;
  helperText?: string;
  onChange: (value: string) => void;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function ValidatedSelect({
  label,
  error,
  helperText,
  onChange,
  required = false,
  options,
  placeholder = "Selecciona...",
  ...selectProps
}: ValidatedSelectProps) {
  return (
    <div>
      <label htmlFor={selectProps.id} className="mb-1 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        {...selectProps}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none transition-colors ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-gray-200 focus:border-cerise-400 focus:ring-2 focus:ring-cerise-100"
        } ${selectProps.disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
