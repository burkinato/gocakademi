import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { DataTable } from '../shared/DataTable';
import { SearchBar } from '../shared/SearchBar';
import { Pagination } from '../shared/Pagination';
import { StatusBadge } from '../shared/StatusBadge';
import { ActivityLog } from '../../types';

export const AdminActivityLogs: React.FC = () => {
    const navigate = useNavigate();
    const {
        logs,
        loading,
        pagination,
        fetchLogs
    } = useActivityLogs();

    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');

    useEffect(() => {
        fetchLogs({ page: 1, limit: 20 });
    }, [fetchLogs]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs({ page: 1, limit: 20, search, action: actionFilter });
        }, 500);
        return () => clearTimeout(timer);
    }, [search, actionFilter, fetchLogs]);

    const handlePageChange = (page: number) => {
        fetchLogs({ page, limit: pagination.limit, search, action: actionFilter });
    };

    const columns = [
        {
            key: 'createdAt',
            header: 'Tarih',
            width: '180px',
            render: (log: ActivityLog) => new Date(log.createdAt).toLocaleString('tr-TR')
        },
        {
            key: 'user',
            header: 'Kullanıcı',
            render: (log: ActivityLog) => (
                <span className="font-medium text-text-light dark:text-text-dark">
                    User #{log.userId}
                </span>
            )
        },
        {
            key: 'action',
            header: 'İşlem',
            render: (log: ActivityLog) => (
                <StatusBadge
                    status={log.action}
                    variant="info"
                    label={log.action.replace(/_/g, ' ')}
                />
            )
        },
        {
            key: 'details',
            header: 'Detaylar',
            render: (log: ActivityLog) => (
                <span className="text-sm text-subtext-light dark:text-subtext-dark truncate max-w-xs block" title={JSON.stringify(log.details)}>
                    {log.resourceType} {log.resourceId ? `#${log.resourceId}` : ''}
                </span>
            )
        },
        {
            key: 'ipAddress',
            header: 'IP Adresi',
            width: '140px',
            render: (log: ActivityLog) => log.ipAddress || '-'
        }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto p-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-text-light dark:text-text-dark">Aktivite Logları</h1>
                    <p className="text-subtext-light dark:text-subtext-dark text-base font-normal">Sistem üzerindeki tüm işlemleri izleyin.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="">Tüm İşlemler</option>
                        <option value="LOGIN">Giriş</option>
                        <option value="CREATE_USER">Kullanıcı Oluşturma</option>
                        <option value="UPDATE_USER">Kullanıcı Güncelleme</option>
                        <option value="DELETE_USER">Kullanıcı Silme</option>
                    </select>
                    <SearchBar value={search} onChange={setSearch} placeholder="Kullanıcı veya detay ara..." className="w-full md:w-64" />
                </div>
            </header>

            {/* Content */}
            <DataTable
                columns={columns}
                data={logs}
                loading={loading}
                emptyMessage="Kayıt bulunamadı."
            />

            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
            />
        </div>
    );
};
