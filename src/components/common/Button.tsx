import React from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | "general" | 'outline' | 'ghost' | 'gradient' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    to?: string;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    to,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 font-medium  transition-all active:scale-95 hover:scale-105";

    const variants = {
        primary: "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]",
        secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600",
        general: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all",
        outline: "border border-slate-700 hover:bg-slate-800/50 text-slate-300 hover:text-white",
        ghost: "hover:bg-slate-800/50 text-slate-300 hover:text-white hover:scale-100", // Ghost buttons usually don't scale up
        gradient: "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)]",
        danger: "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white shadow-lg shadow-rose-500/10 hover:shadow-rose-500/25",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm rounded-lg",
        md: "px-4 py-2 text-sm md:text-base rounded-lg",
        lg: "px-8 py-3 text-lg rounded-xl",
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    if (to) {
        return (
            <Link to={to} className={combinedClassName}>
                {children}
            </Link>
        );
    }

    return (
        <button className={combinedClassName} {...props}>
            {children}
        </button>
    );
};
