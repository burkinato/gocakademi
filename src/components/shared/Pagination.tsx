import React from 'react';
import { Button } from './Button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage
}) => {
    if (totalPages <= 1) return null;

    // Calculate range of pages to show
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            {totalItems !== undefined && itemsPerPage !== undefined && (
                <p className="text-sm text-subtext-light dark:text-subtext-dark">
                    Toplam <span className="font-medium text-text-light dark:text-text-dark">{totalItems}</span> kayıttan <span className="font-medium text-text-light dark:text-text-dark">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium text-text-light dark:text-text-dark">{Math.min(currentPage * itemsPerPage, totalItems)}</span> arası gösteriliyor
                </p>
            )}

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2"
                >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                </Button>

                {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="px-2 text-subtext-light dark:text-subtext-dark">...</span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page as number)}
                                className={`
                  min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                  ${currentPage === page
                                        ? 'bg-primary text-white'
                                        : 'text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }
                `}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2"
                >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                </Button>
            </div>
        </div>
    );
};
