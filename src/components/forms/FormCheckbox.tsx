import React from "react";
import { useFormContext } from "react-hook-form";

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  description?: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
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
      <div className="flex items-start gap-2.5">
        <input
          id={name}
          type="checkbox"
          {...register(name)}
          className={`mt-0.5 rounded border-zinc-350 dark:border-zinc-800 text-brand-primary focus:ring-primary-glow h-4 w-4 transition cursor-pointer ${
            errorMessage ? "border-red-500" : ""
          } ${className}`}
          {...props}
        />
        <div className="flex flex-col leading-tight select-none">
          <label htmlFor={name} className="text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
            {label}
          </label>
          {description && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">
              {description}
            </span>
          )}
        </div>
      </div>

      {errorMessage && (
        <p className="text-[10px] text-red-500 font-bold tracking-tight animate-fadeIn">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormCheckbox;
