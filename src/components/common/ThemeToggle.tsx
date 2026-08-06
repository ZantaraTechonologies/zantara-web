import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../app/ThemeContext';

interface ThemeToggleProps {
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`inline-flex items-center justify-center p-2 rounded-xl border transition-all active:scale-95 bg-slate-50 border-slate-100 text-slate-500 hover:text-brand-emerald hover:border-emerald-200 dark:bg-surface dark:border-slate-700/40 dark:text-slate-400 dark:hover:text-brand-emerald ${className}`}
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
};

export default ThemeToggle;
