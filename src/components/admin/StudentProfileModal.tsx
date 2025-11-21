import React, { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { FormField } from '../shared/FormField';
import { Button } from '../shared/Button';
import { StudentProfile, StudentWithProfile } from '../../types';

interface StudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<StudentProfile>) => Promise<void>;
    student: StudentWithProfile;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose, onSave, student }) => {
    const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'academic' | 'emergency'>('personal');
    const [formData, setFormData] = useState<Partial<StudentProfile>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (student && student.profile) {
            setFormData(student.profile);
        } else {
            setFormData({});
        }
    }, [student, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Failed to save profile', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'personal', label: 'Kişisel Bilgiler' },
        { id: 'contact', label: 'İletişim' },
        { id: 'academic', label: 'Akademik' },
        { id: 'emergency', label: 'Acil Durum' },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${student.firstName} ${student.lastName} - Öğrenci Profili`}
            size="lg"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        İptal
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2
                ${activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-subtext-light dark:text-subtext-dark hover:text-text-light dark:hover:text-text-dark'
                                }
              `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {activeTab === 'personal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Öğrenci Numarası"
                                value={formData.studentNumber || ''}
                                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                            />
                            <FormField
                                label="Doğum Tarihi"
                                type="date"
                                value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            />
                            <FormField
                                label="Cinsiyet"
                                as="select"
                                value={formData.gender || ''}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                options={[
                                    { value: '', label: 'Seçiniz' },
                                    { value: 'male', label: 'Erkek' },
                                    { value: 'female', label: 'Kadın' },
                                    { value: 'other', label: 'Diğer' },
                                ]}
                            />
                            <FormField
                                label="Uyruk"
                                value={formData.nationality || ''}
                                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                            />
                            <FormField
                                label="Biyografi"
                                as="textarea"
                                value={formData.bio || ''}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="md:col-span-2"
                            />
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Telefon"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <FormField
                                label="İkincil E-posta"
                                type="email"
                                value={formData.secondaryEmail || ''}
                                onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
                            />
                            <FormField
                                label="Adres"
                                as="textarea"
                                value={formData.address || ''}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="md:col-span-2"
                            />
                            <FormField
                                label="Şehir"
                                value={formData.city || ''}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                            <FormField
                                label="İlçe/Eyalet"
                                value={formData.state || ''}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            />
                            <FormField
                                label="Ülke"
                                value={formData.country || ''}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            />
                            <FormField
                                label="Posta Kodu"
                                value={formData.postalCode || ''}
                                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                            />
                        </div>
                    )}

                    {activeTab === 'academic' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Kayıt Tarihi"
                                type="date"
                                value={formData.enrollmentDate ? new Date(formData.enrollmentDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                            />
                            <FormField
                                label="Beklenen Mezuniyet"
                                type="date"
                                value={formData.expectedGraduationDate ? new Date(formData.expectedGraduationDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => setFormData({ ...formData, expectedGraduationDate: e.target.value })}
                            />
                            <FormField
                                label="Seviye"
                                value={formData.currentLevel || ''}
                                onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                            />
                            <FormField
                                label="GPA"
                                type="number"
                                step="0.01"
                                value={formData.gpa || ''}
                                onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
                            />
                            <FormField
                                label="Notlar"
                                as="textarea"
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="md:col-span-2"
                            />
                        </div>
                    )}

                    {activeTab === 'emergency' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Ad Soyad"
                                value={formData.emergencyContactName || ''}
                                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                            />
                            <FormField
                                label="Yakınlık Derecesi"
                                value={formData.emergencyContactRelationship || ''}
                                onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                            />
                            <FormField
                                label="Telefon"
                                value={formData.emergencyContactPhone || ''}
                                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                className="md:col-span-2"
                            />
                        </div>
                    )}
                </form>
            </div>
        </Modal>
    );
};
