import React from "react";
import { useFormContext } from "react-hook-form";
import { Calendar } from "lucide-react";

interface FormDatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  description?: string;
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
  name,
  label,
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

      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-450 dark:text-zinc-500 w-4 h-4 flex items-center justify-center pointer-events-none">
          <Calendar className="w-3.5 h-3.5" />
        </div>

        <input
          id={name}
          type="date"
          {...register(name)}
          className={`w-full py-2.5 pl-10 pr-4 rounded-xl border text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-glow transition duration-155 cursor-pointer ${
            errorMessage
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              : "border-zinc-200 dark:border-zinc-800 focus:border-brand-primary"
          } ${className}`}
          {...props}
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

export default FormDatePicker;
