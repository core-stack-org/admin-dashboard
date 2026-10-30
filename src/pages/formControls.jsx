import React, { useState } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import { ChevronDown, Check, Loader2 } from "lucide-react";

export const FormSelect = ({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  emptyMessage = "No results found",
}) => {
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.value === value) || null;

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) =>
          option.label.toLowerCase().includes(query.toLowerCase()),
        );

  const groups = [];
  const groupIndex = new Map();
  filteredOptions.forEach((option) => {
    const key = option.group || "";
    if (!groupIndex.has(key)) {
      groupIndex.set(key, []);
      groups.push([key, groupIndex.get(key)]);
    }
    groupIndex.get(key).push(option);
  });

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        {label}
      </label>
      <Combobox
        value={selected}
        onChange={(option) => onChange(option ? option.value : "")}
        onClose={() => setQuery("")}
        disabled={disabled}
        by="value"
      >
        <div className="relative">
          <div className="group relative flex items-center rounded-lg border border-gray-300 bg-white shadow-sm transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/40 hover:border-gray-400 has-[:disabled]:cursor-not-allowed has-[:disabled]:border-gray-200 has-[:disabled]:bg-gray-50 has-[:disabled]:hover:border-gray-200">
            <ComboboxInput
              className="w-full rounded-lg bg-transparent py-2.5 pl-3.5 pr-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:text-gray-400"
              displayValue={(option) => option?.label ?? ""}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="h-4 w-4 text-gray-400 group-has-[:disabled]:text-gray-300" />
            </ComboboxButton>
          </div>

          <ComboboxOptions
            transition
            className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-lg border border-gray-100 bg-white py-1 shadow-lg ring-1 ring-black/5 transition duration-100 ease-in focus:outline-none data-[closed]:data-[leave]:opacity-0"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3.5 py-2 text-sm text-gray-500">
                {emptyMessage}
              </div>
            ) : (
              groups.map(([group, groupOptions]) => (
                <div key={group || "__ungrouped"}>
                  {group && (
                    <div className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {group}
                    </div>
                  )}
                  {groupOptions.map((option) => (
                    <ComboboxOption
                      key={option.value}
                      value={option}
                      className="group/option relative cursor-pointer select-none py-2 pl-9 pr-3.5 text-sm text-gray-900 data-[focus]:bg-blue-50 data-[focus]:text-blue-900"
                    >
                      <span className="block truncate group-data-[selected]/option:font-semibold">
                        {option.label}
                      </span>
                      <span className="absolute inset-y-0 left-3 hidden items-center text-blue-600 group-data-[selected]/option:flex">
                        <Check className="h-4 w-4" />
                      </span>
                    </ComboboxOption>
                  ))}
                </div>
              ))
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  );
};

export const FormInput = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
      {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      {label}
    </label>
    <input
      className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      {...props}
    />
  </div>
);

export const SectionHeading = ({ children }) => (
  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
    {children}
  </h2>
);

export const PageCard = ({ icon: Icon, title, subtitle, children }) => (
  <div className="min-h-screen bg-gray-50 px-4 pt-16">
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  </div>
);

export const SubmitButton = ({
  loading,
  loadingText,
  disabled,
  children,
  ...props
}) => (
  <button
    type="submit"
    {...props}
    disabled={loading || disabled}
    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {loading ? loadingText : children}
  </button>
);
