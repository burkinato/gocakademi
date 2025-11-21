import React from 'react';

interface StatusBadgeProps {
    status: string | boolean;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
    label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant, label }) => {
    let computedVariant = variant;
    let computedLabel = label || String(status);

    // Auto-detect variant if not provided
    if (!variant) {
        if (status === true || status === 'active' || status === 'published' || status === 'completed') {
            computedVariant = 'success';
            if (!label) computedLabel = 'Aktif';
        } else if (status === false || status === 'inactive' || status === 'deleted' || status === 'failed') {
            computedVariant = 'error';
            if (!label) computedLabel = 'Pasif';
        } else if (status === 'pending' || status === 'draft') {
            computedVariant = 'warning';
        } else {
            computedVariant = 'default';
        }
    }

    const variants = {
        success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[computedVariant || 'default']}`}>
            {computedLabel}
        </span>
    );
};
