import React from "react";
import { useFormContext } from "react-hook-form";

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label?: string;
  options: SelectOption[];
  description?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  name,
  label,
  options,
  description,
  className = "",
  ...props
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-[11px] font-bold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <select
        id={name}
        {...register(name)}
        className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-glow transition duration-155 cursor-pointer ${
          errorMessage
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
            : "border-zinc-200 dark:border-zinc-800 focus:border-brand-primary"
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-white dark:bg-zinc-900">
            {option.label}
          </option>
        ))}
      </select>

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

export default FormSelect;
