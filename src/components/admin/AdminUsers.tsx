import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserManagement } from '../../hooks/useUserManagement';
import { DataTable } from '../shared/DataTable';
import { Button } from '../shared/Button';
import { SearchBar } from '../shared/SearchBar';
import { Pagination } from '../shared/Pagination';
import { StatusBadge } from '../shared/StatusBadge';
import { UserModal } from './UserModal';
import { User } from '../../types';
import { Modal } from '../shared/Modal';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { canSeeActiveToggle, transitionStyle } from '../../utils/visibility';

export const AdminUsers: React.FC = () => {
    const navigate = useNavigate();
    const {
        users,
        loading,
        pagination,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        changeStatus
    } = useUserManagement();

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmUserId, setConfirmUserId] = useState<number | null>(null);
    const [confirmStep, setConfirmStep] = useState<1 | 2>(1);
    const { user: currentUser } = useAuthStore();

    useEffect(() => {
        fetchUsers({ page: 1, limit: 10 });
    }, [fetchUsers]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers({ page: 1, limit: 10, search, role: roleFilter || undefined });
        }, 500);
        return () => clearTimeout(timer);
    }, [search, roleFilter, fetchUsers]);

    const handlePageChange = (page: number) => {
        fetchUsers({ page, limit: pagination.limit, search, role: roleFilter || undefined });
    };

    const handleSaveUser = async (data: Partial<User>) => {
        try {
            if (editingUser) {
                await updateUser(editingUser.id, data);
                toast.success('Kullanıcı başarıyla güncellendi', { duration: 3000 });
            } else {
                await createUser(data);
                toast.success('Kullanıcı başarıyla oluşturuldu', { duration: 3000 });
            }
            fetchUsers({ page: pagination.page, limit: pagination.limit, search, role: roleFilter || undefined });
            setIsModalOpen(false);
        } catch (e: any) {
            toast.error(e?.message || 'İşlem başarısız oldu', { duration: 3000 });
        }
    };

    const handleDeleteUser = (id: number) => {
        setConfirmUserId(id);
        setConfirmStep(1);
        setConfirmOpen(true);
    };

    const proceedDelete = async () => {
        if (confirmStep === 1) {
            setConfirmStep(2);
            return;
        }
        if (!confirmUserId) return;
        const t = toast.loading('Siliniyor...', { duration: 3000 });
        try {
            await deleteUser(confirmUserId);
            toast.dismiss(t);
            toast.success('Kullanıcı başarıyla silindi', { duration: 3000 });
            fetchUsers({ page: pagination.page, limit: pagination.limit, search, role: roleFilter || undefined });
        } catch (e: any) {
            toast.dismiss(t);
            toast.error(e?.message || 'Silme işlemi başarısız oldu', { duration: 3000 });
        } finally {
            setConfirmOpen(false);
            setConfirmUserId(null);
            setConfirmStep(1);
        }
    };

    const handleToggleStatus = async (user: User) => {
        try {
            await changeStatus(user.id, !user.isActive);
            toast.success('Durum başarıyla güncellendi', { duration: 3000 });
            fetchUsers({ page: pagination.page, limit: pagination.limit, search, role: roleFilter || undefined });
        } catch (e: any) {
            toast.error(e?.message || 'İşlem başarısız oldu', { duration: 3000 });
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Ad Soyad',
            render: (user: User) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                        {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                        <p className="font-medium text-text-light dark:text-text-dark">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-subtext-light dark:text-subtext-dark">{user.email}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'role',
            header: 'Rol',
            render: (user: User) => {
                const roles = {
                    admin: { label: 'Yönetici', variant: 'error' },
                    instructor: { label: 'Eğitmen', variant: 'warning' },
                    student: { label: 'Öğrenci', variant: 'info' }
                };
                const role = roles[user.role as keyof typeof roles] || { label: user.role, variant: 'default' };
                return <StatusBadge status={role.label} variant={role.variant as any} label={role.label} />;
            }
        },
        {
            key: 'isActive',
            header: 'Durum',
            render: (user: User) => <StatusBadge status={user.isActive} />
        },
        {
            key: 'createdAt',
            header: 'Kayıt Tarihi',
            render: (user: User) => new Date(user.createdAt).toLocaleDateString('tr-TR')
        },
        {
            key: 'actions',
            header: 'İşlemler',
            width: '120px',
            render: (user: User) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setEditingUser(user); setIsModalOpen(true); }}
                        className="p-1 text-subtext-light dark:text-subtext-dark hover:text-primary transition-colors"
                        title="Düzenle"
                    >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    {canSeeActiveToggle({ currentRole: currentUser?.role ?? null, currentUserId: currentUser?.id ?? null, targetUserId: user.id, targetUserRole: user.role, targetUserActive: user.isActive }) && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(user); }}
                            className={`p-1 transition-colors ${user.isActive ? 'text-emerald-500 hover:text-emerald-600' : 'text-subtext-light hover:text-emerald-500'}`}
                            title={user.isActive ? 'Pasife Al' : 'Aktifleştir'}
                            style={transitionStyle(true)}
                        >
                            <span className="material-symbols-outlined text-[20px]">{user.isActive ? 'toggle_on' : 'toggle_off'}</span>
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }}
                        className="p-1 text-subtext-light dark:text-subtext-dark hover:text-red-500 transition-colors"
                        title="Sil"
                    >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto p-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-text-light dark:text-text-dark">Kullanıcı Yönetimi</h1>
                    <p className="text-subtext-light dark:text-subtext-dark text-base font-normal">Sistemdeki tüm kullanıcıları yönetin.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <SearchBar value={search} onChange={setSearch} className="w-full md:w-64" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                    >
                        <option value="">Tüm Roller</option>
                        <option value="student">Öğrenci</option>
                        <option value="instructor">Eğitmen</option>
                        <option value="admin">Yönetici</option>
                    </select>
                    <Button
                        variant="outline"
                        onClick={() => {
                            const headers = ['id','firstName','lastName','email','role','isActive','phone','city','country'];
                            const rows = users.map(u => [u.id,u.firstName,u.lastName,u.email,u.role,u.isActive ? 'active' : 'inactive',u.phone||'',u.city||'',u.country||'']);
                            const csv = [headers.join(','), ...rows.map(r => r.map(v => `${String(v).replace(/"/g,'\"')}`).join(','))].join('\n');
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'users.csv';
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success('Kullanıcılar CSV olarak dışa aktarıldı', { duration: 3000 });
                        }}
                        icon={<span className="material-symbols-outlined">download</span>}
                    >
                        Dışa Aktar (CSV)
                    </Button>
                    <Button onClick={() => { setEditingUser(null); setIsModalOpen(true); }} icon={<span className="material-symbols-outlined">add</span>}>
                        Yeni Kullanıcı
                    </Button>
                </div>
            </header>

            {/* Content */}
            <DataTable
                columns={columns}
                data={users}
                loading={loading}
                emptyMessage="Kullanıcı bulunamadı."
            />

            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
            />

            {/* Modal */}
            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                user={editingUser}
            />

            <Modal
                isOpen={confirmOpen}
                onClose={() => { setConfirmOpen(false); setConfirmStep(1); setConfirmUserId(null); }}
                title={confirmStep === 1 ? 'Emin misiniz?' : 'Silme işlemini onayla'}
                footer={
                    <>
                        <Button variant="outline" onClick={() => { setConfirmOpen(false); setConfirmStep(1); setConfirmUserId(null); }}>İptal</Button>
                        <Button variant={confirmStep === 1 ? 'default' : 'danger'} onClick={proceedDelete}>
                            {confirmStep === 1 ? 'Devam' : 'Sil'}
                        </Button>
                    </>
                }
            >
                {confirmStep === 1 ? (
                    <p className="text-sm text-subtext-light dark:text-subtext-dark">Bu kullanıcıyı silmek istediğinize emin misiniz?</p>
                ) : (
                    <p className="text-sm text-red-600 dark:text-red-400">Bu işlem geri alınamaz. Silmeyi onaylıyor musunuz?</p>
                )}
            </Modal>
        </div>
    );
};
