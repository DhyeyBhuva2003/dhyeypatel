import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff, Lock } from "lucide-react";

interface FormPasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  showStrength?: boolean;
}

export const FormPasswordInput: React.FC<FormPasswordInputProps> = ({
  name,
  label,
  showStrength = false,
  className = "",
  ...props
}) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const [showPassword, setShowPassword] = useState(false);
  const passwordValue = watch(name) || "";

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  // Password strength calculations
  const getStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-transparent", text: "text-transparent" };
    let score = 0;
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score, label: "Too Weak", color: "bg-red-500", text: "text-red-500" };
    if (score === 2) return { score, label: "Weak", color: "bg-orange-500", text: "text-orange-500" };
    if (score === 3) return { score, label: "Medium", color: "bg-amber-500", text: "text-amber-500" };
    return { score, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
  };

  const strength = getStrength(passwordValue);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-[11px] font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-450 dark:text-zinc-500 w-4 h-4 flex items-center justify-center pointer-events-none">
          <Lock className="w-3.5 h-3.5" />
        </div>

        <input
          id={name}
          type={showPassword ? "text" : "password"}
          {...register(name)}
          className={`w-full py-2.5 pl-10 pr-10 rounded-xl border text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-glow transition duration-155 ${
            errorMessage
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              : "border-zinc-200 dark:border-zinc-800 focus:border-brand-primary"
          } ${className}`}
          {...props}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer flex items-center justify-center p-1 rounded-md transition"
        >
          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showStrength && passwordValue && (
        <div className="space-y-1 pt-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
            <span className="text-zinc-400">Strength:</span>
            <span className={strength.text}>{strength.label}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 h-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-full rounded-full transition-all duration-300 ${
                  i <= strength.score ? strength.color : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="text-[10px] text-red-500 font-bold tracking-tight animate-fadeIn">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormPasswordInput;
