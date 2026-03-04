import { InputHTMLAttributes, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  rightAction?: React.ReactNode;
}

const Input = ({
  label,
  icon,
  rightAction,
  type,
  className = "",
  id,
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <label
            className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            htmlFor={id}
          >
            {label}
          </label>
          {rightAction}
        </div>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 text-xl">
              {icon}
            </span>
          </div>
        )}
        <input
          id={id}
          type={inputType}
          className={`block w-full ${icon ? "pl-10" : "pl-3"} ${isPassword ? "pr-10" : "pr-3"} py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            <span className="material-symbols-outlined text-xl">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
