import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 tracking-[0.015em] overflow-hidden";

    const variants = {
        primary: "text-white hover:bg-opacity-90 shadow-md hover:shadow-lg focus:ring-primary" + " bg-[#003366]",
        secondary: "bg-secondary text-primary hover:bg-opacity-90 shadow-md hover:shadow-lg focus:ring-secondary",
        outline: "border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary",
        ghost: "text-primary hover:bg-primary/10",
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-md focus:ring-red-600",
        neutral: "bg-gray-200 dark:bg-gray-800 text-text-light dark:text-text-dark hover:bg-gray-300 dark:hover:bg-gray-700",
    };

    const sizes = {
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    return (
        <button
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {!isLoading && icon && iconPosition === 'left' && (
                <span className="mr-2">{icon}</span>
            )}
            {children}
            {!isLoading && icon && iconPosition === 'right' && (
                <span className="ml-2">{icon}</span>
            )}
        </button>
    );
};
