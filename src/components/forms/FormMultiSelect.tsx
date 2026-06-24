import React, { useState, KeyboardEvent } from "react";
import { useFormContext } from "react-hook-form";
import { X } from "lucide-react";

interface FormMultiSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
}

export const FormMultiSelect: React.FC<FormMultiSelectProps> = ({
  name,
  label,
  placeholder = "Type and press Enter...",
  description,
}) => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [inputValue, setInputValue] = useState("");
  const selectedValues: string[] = watch(name) || [];

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = inputValue.trim().replace(/,/g, "");
      if (val && !selectedValues.includes(val)) {
        const nextValues = [...selectedValues, val];
        setValue(name, nextValues, { shouldValidate: true, shouldDirty: true });
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && selectedValues.length > 0) {
      // Remove last item on backspace if input is empty
      const nextValues = selectedValues.slice(0, -1);
      setValue(name, nextValues, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleRemove = (valueToRemove: string) => {
    const nextValues = selectedValues.filter((v) => v !== valueToRemove);
    setValue(name, nextValues, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-[11px] font-bold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div
        className={`flex flex-wrap items-center gap-2 p-2 rounded-xl border bg-zinc-50/50 dark:bg-zinc-950 min-h-[42px] focus-within:ring-2 focus-within:ring-primary-glow focus-within:border-brand-primary transition duration-155 ${
          errorMessage ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
        }`}
      >
        {/* Render Selected Items */}
        {selectedValues.map((val) => (
          <span
            key={val}
            className="flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-[10px] font-bold select-none border border-zinc-300 dark:border-zinc-700 animate-fadeIn"
          >
            <span>{val}</span>
            <button
              type="button"
              onClick={() => handleRemove(val)}
              className="p-0.5 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}

        {/* Text Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedValues.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent border-none outline-none text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 min-w-[120px] py-1"
        />
      </div>

      {description && !errorMessage && (
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
          {description}
        </p>
      )}

      {errorMessage && (
        <p className="text-[10px] text-red-500 font-bold tracking-tight animate-fadeIn">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormMultiSelect;
