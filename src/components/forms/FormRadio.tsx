import React from "react";
import { useFormContext } from "react-hook-form";

interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
}

interface FormRadioProps {
  name: string;
  label?: string;
  options: RadioOption[];
  description?: string;
}

export const FormRadio: React.FC<FormRadioProps> = ({
  name,
  label,
  options,
  description,
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
        <label className="block text-[11px] font-bold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="space-y-2">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-start gap-2.5">
            <input
              type="radio"
              id={`${name}-${opt.value}`}
              value={opt.value}
              {...register(name)}
              className="mt-0.5 text-brand-primary focus:ring-primary-glow border-zinc-350 dark:border-zinc-800 h-4 w-4 cursor-pointer"
            />
            <div className="flex flex-col leading-tight select-none">
              <label
                htmlFor={`${name}-${opt.value}`}
                className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                {opt.label}
              </label>
              {opt.description && (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">
                  {opt.description}
                </span>
              )}
            </div>
          </div>
        ))}
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

export default FormRadio;
