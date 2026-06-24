import React, { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  description?: string;
  autoResize?: boolean;
  showCounter?: boolean;
  maxCharacters?: number;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  name,
  label,
  description,
  className = "",
  rows = 4,
  autoResize = false,
  showCounter = false,
  maxCharacters,
  ...props
}) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const value = useWatch({ control, name }) || "";
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      // Allow internal scrolling beyond 320px
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(320, Math.max(80, scrollHeight))}px`;
    }
  }, [value, autoResize]);

  const { ref: registerRef, ...registerRest } = register(name);

  const setRefs = (el: HTMLTextAreaElement | null) => {
    textareaRef.current = el;
    registerRef(el);
  };

  const characterCount = value.length;

  return (
    <div className="space-y-1.5 w-full flex flex-col">
      <div className="flex justify-between items-center select-none">
        {label && (
          <label
            htmlFor={name}
            className="block text-[11px] font-black text-zinc-550 dark:text-zinc-400 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        {showCounter && (
          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
            {characterCount} {maxCharacters ? `/ ${maxCharacters}` : ""} chars
          </span>
        )}
      </div>

      <textarea
        id={name}
        rows={rows}
        ref={setRefs}
        {...registerRest}
        className={`w-full py-3 px-4 rounded-xl border text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400/80 focus:outline-none focus:ring-2 focus:ring-primary-glow transition duration-155 overflow-y-auto scrollbar-thin ${
          autoResize ? "resize-none" : "resize-y"
        } ${
          errorMessage
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
            : "border-zinc-200 dark:border-zinc-800 focus:border-brand-primary"
        } ${className}`}
        maxLength={maxCharacters}
        {...props}
      />

      {description && !errorMessage && (
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold select-none leading-normal">
          {description}
        </p>
      )}

      {errorMessage && (
        <p className="text-[10px] text-red-500 font-black tracking-tight animate-fadeIn select-none">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormTextarea;
