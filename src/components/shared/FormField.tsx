import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
    label: string;
    error?: string;
    helperText?: string;
    as?: 'input' | 'textarea' | 'select';
    options?: { value: string | number; label: string }[];
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    error,
    helperText,
    as = 'input',
    className = '',
    options,
    id,
    ...props
}) => {
    const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    const baseClasses = `
    w-full rounded-lg border bg-white dark:bg-gray-800 px-3 py-2 text-sm 
    text-text-light dark:text-text-dark placeholder:text-subtext-light dark:placeholder:text-subtext-dark
    focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-gray-200 dark:border-gray-700 focus:border-primary'
        }
    ${className}
  `;

    return (
        <div className="flex flex-col gap-1.5 group">
            <label htmlFor={inputId} className="text-sm font-medium text-text-light dark:text-text-dark transition-colors duration-300 group-focus-within:text-primary">
                {label} {props.required && <span className="text-red-500">*</span>}
            </label>

            {as === 'textarea' ? (
                <textarea
                    id={inputId}
                    className={`${baseClasses} min-h-[100px] resize-y`}
                    {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                />
            ) : as === 'select' ? (
                <select
                    id={inputId}
                    className={baseClasses}
                    {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
                >
                    {options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : (
                <input
                    id={inputId}
                    className={baseClasses}
                    {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                />
            )}

            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {error}
                </p>
            )}

            {!error && helperText && (
                <p className="text-xs text-subtext-light dark:text-subtext-dark">
                    {helperText}
                </p>
            )}
        </div>
    );
};
