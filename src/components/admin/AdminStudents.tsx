import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentManagement } from '../../hooks/useStudentManagement';
import { DataTable } from '../shared/DataTable';
import { Button } from '../shared/Button';
import { SearchBar } from '../shared/SearchBar';
import { Pagination } from '../shared/Pagination';
import { StatusBadge } from '../shared/StatusBadge';
import { StudentProfileModal } from './StudentProfileModal';
import { StudentWithProfile, StudentProfile } from '../../types';

export const AdminStudents: React.FC = () => {
    const navigate = useNavigate();
    const {
        students,
        loading,
        pagination,
        fetchStudents,
        updateProfile
    } = useStudentManagement();

    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentWithProfile | null>(null);

    useEffect(() => {
        fetchStudents({ page: 1, limit: 10 });
    }, [fetchStudents]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents({ page: 1, limit: 10, search });
        }, 500);
        return () => clearTimeout(timer);
    }, [search, fetchStudents]);

    const handlePageChange = (page: number) => {
        fetchStudents({ page, limit: pagination.limit, search });
    };

    const handleSaveProfile = async (data: Partial<StudentProfile>) => {
        if (selectedStudent) {
            await updateProfile(selectedStudent.id, data);
            fetchStudents({ page: pagination.page, limit: pagination.limit, search });
        }
    };

    const columns = [
        {
            key: 'studentNumber',
            header: 'Öğrenci No',
            render: (student: StudentWithProfile) => student.profile?.studentNumber || '-'
        },
        {
            key: 'name',
            header: 'Ad Soyad',
            render: (student: StudentWithProfile) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                        {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                        <p className="font-medium text-text-light dark:text-text-dark">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-subtext-light dark:text-subtext-dark">{student.email}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'level',
            header: 'Seviye',
            render: (student: StudentWithProfile) => student.profile?.currentLevel || '-'
        },
        {
            key: 'gpa',
            header: 'GPA',
            render: (student: StudentWithProfile) => student.profile?.gpa?.toFixed(2) || '-'
        },
        {
            key: 'enrollmentDate',
            header: 'Kayıt Tarihi',
            render: (student: StudentWithProfile) => student.profile?.enrollmentDate ? new Date(student.profile.enrollmentDate).toLocaleDateString('tr-TR') : '-'
        },
        {
            key: 'status',
            header: 'Durum',
            render: (student: StudentWithProfile) => <StatusBadge status={student.isActive} />
        },
        {
            key: 'actions',
            header: 'İşlemler',
            render: (student: StudentWithProfile) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); setIsModalOpen(true); }}
                >
                    Profili Düzenle
                </Button>
            )
        }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto p-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-text-light dark:text-text-dark">Öğrenci Yönetimi</h1>
                    <p className="text-subtext-light dark:text-subtext-dark text-base font-normal">Öğrenci profillerini ve belgelerini yönetin.</p>
                </div>
                <div className="w-full md:w-64">
                    <SearchBar value={search} onChange={setSearch} />
                </div>
            </header>

            {/* Content */}
            <DataTable
                columns={columns}
                data={students}
                loading={loading}
                emptyMessage="Öğrenci bulunamadı."
            />

            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
            />

            {/* Modal */}
            {selectedStudent && (
                <StudentProfileModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveProfile}
                    student={selectedStudent}
                />
            )}
        </div>
    );
};
