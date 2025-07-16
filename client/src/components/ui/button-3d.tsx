import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Button3D = forwardRef<HTMLButtonElement, Button3DProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const variants = {
      default: "bg-white text-gray-900 hover:bg-gray-50",
      primary: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700",
      secondary: "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800",
      outline: "border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative rounded-xl font-semibold transition-all duration-200 ease-out",
          "transform hover:scale-105 active:scale-95",
          "shadow-lg hover:shadow-xl",
          "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

Button3D.displayName = "Button3D";

export { Button3D };