import React from "react";
import { useFormContext } from "react-hook-form";

interface FormSwitchProps {
  name: string;
  label: string;
  description?: string;
}

export const FormSwitch: React.FC<FormSwitchProps> = ({
  name,
  label,
  description,
}) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const isChecked = watch(name) || false;
  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between py-1">
        <div className="flex flex-col leading-tight select-none">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            {label}
          </span>
          {description && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5 max-w-[85%]">
              {description}
            </span>
          )}
        </div>

        {/* Custom switch element */}
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            id={name}
            {...register(name)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary dark:border-zinc-700 transition"></div>
        </label>
      </div>

      {errorMessage && (
        <p className="text-[10px] text-red-500 font-bold tracking-tight animate-fadeIn">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormSwitch;
