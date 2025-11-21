import React from 'react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    placeholder = 'Ara...',
    className = ''
}) => {
    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-subtext-light dark:text-subtext-dark">search</span>
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="
          block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
          bg-white dark:bg-gray-800 text-text-light dark:text-text-dark placeholder:text-subtext-light dark:placeholder:text-subtext-dark
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          text-sm transition-all
        "
                placeholder={placeholder}
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-subtext-light dark:text-subtext-dark hover:text-text-light dark:hover:text-text-dark"
                >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            )}
        </div>
    );
};
