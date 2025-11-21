import React, { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { FormField } from '../shared/FormField';
import { Button } from '../shared/Button';
import { User } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { userManagementService } from '../../services/userManagementService';
import { canSeeActiveToggle, canSeeTwoFactor, transitionStyle, baseTransitionClass } from '../../utils/visibility';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<User>) => Promise<void>;
    user?: User | null;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user }) => {
    const [formData, setFormData] = useState<Partial<User>>({
        firstName: '',
        lastName: '',
        email: '',
        role: 'student',
        phone: '',
        isActive: true,
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        dateOfBirth: undefined,
        bio: '',
    });
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [industry, setIndustry] = useState('');
    const [street, setStreet] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [district, setDistrict] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [emergencyContacts, setEmergencyContacts] = useState<Array<{ name: string; phone: string; relationship?: string }>>([]);
    const cryptoRandom = () => Math.random().toString(36).slice(2, 18);
    const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
    const [secondaryEmail, setSecondaryEmail] = useState<string>('');
    const [website, setWebsite] = useState<string>('');
    const [linkedin, setLinkedin] = useState<string>('');
    const [preferences, setPreferences] = useState<{ newsletter: boolean; smsNotifications: boolean; marketingOptIn: boolean }>({ newsletter: false, smsNotifications: false, marketingOptIn: false });
    const [notes, setNotes] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'address' | 'prefs'>('profile');
    const { user: currentUser } = useAuthStore();
    const visibilityCtx = {
        currentRole: currentUser?.role ?? null,
        currentUserId: currentUser?.id ?? null,
        targetUserId: user?.id ?? null,
        targetUserRole: user?.role ?? null,
        targetUserActive: user?.isActive ?? null,
    } as const;

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phone: user.phone || '',
                isActive: user.isActive,
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                country: user.country || '',
                postalCode: user.postalCode || '',
                dateOfBirth: user.dateOfBirth || undefined,
                bio: user.bio || '',
            });
            setJobTitle((user as any).jobTitle || '');
            setCompany((user as any).company || '');
            setIndustry((user as any).industry || '');
            setStreet((user as any).street || '');
            setNeighborhood((user as any).neighborhood || '');
            setDistrict((user as any).district || '');
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                role: 'student',
                phone: '',
                isActive: true,
                address: '',
                city: '',
                state: '',
                country: '',
                postalCode: '',
                dateOfBirth: undefined,
                bio: '',
            });
            setPassword('');
            setJobTitle('');
            setCompany('');
            setIndustry('');
            setStreet('');
            setNeighborhood('');
            setDistrict('');
        }
        setErrors({});
        setAvatarPreview(null);
        setEmergencyContacts([]);
        setPhoneNumbers([]);
        setSecondaryEmail('');
        setWebsite('');
        setLinkedin('');
        setPreferences({ newsletter: false, smsNotifications: false, marketingOptIn: false });
        setNotes('');
    }, [user, isOpen]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName) newErrors.firstName = 'Ad zorunludur';
        if (!formData.lastName) newErrors.lastName = 'Soyad zorunludur';
        if (!formData.email) newErrors.email = 'E-posta zorunludur';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email!)) newErrors.email = 'Geçersiz e-posta formatı';

        if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Telefon numarası geçersiz';
        if (formData.postalCode && !/^\d{5}$/.test(formData.postalCode)) newErrors.postalCode = 'Posta kodu 5 haneli olmalı';
        if (secondaryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(secondaryEmail)) newErrors.secondaryEmail = 'Geçersiz ikinci e-posta';
        if (phoneNumbers.some(p => p && p.replace(/\D/g, '').length < 10)) newErrors.phoneNumbers = 'Ek telefonlardan biri geçersiz';

        if (!user && !password) newErrors.password = 'Şifre zorunludur';
        if (password && (password.length < 10 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*]/.test(password))) {
            newErrors.password = 'Şifre 10+ karakter, büyük/küçük harf, rakam ve özel karakter içermeli';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const dataToSave: any = { ...formData };

            // Basic fields
            if (password) dataToSave.password = password;
            if (avatarPreview) dataToSave.profileImageUrl = avatarPreview;
            if (formData.dateOfBirth) dataToSave.dateOfBirth = formData.dateOfBirth;

            // Job fields
            if (jobTitle) dataToSave.jobTitle = jobTitle;
            if (company) dataToSave.company = company;
            if (industry) dataToSave.industry = industry;

            // Address details
            if (street) dataToSave.street = street;
            if (neighborhood) dataToSave.neighborhood = neighborhood;
            if (district) dataToSave.district = district;

            // Contact fields
            if (secondaryEmail) dataToSave.secondaryEmail = secondaryEmail;
            if (website) dataToSave.website = website;
            if (linkedin) dataToSave.linkedin = linkedin;

            // Preferences
            dataToSave.newsletterEnabled = preferences.newsletter;
            dataToSave.smsNotificationsEnabled = preferences.smsNotifications;
            dataToSave.marketingOptIn = preferences.marketingOptIn;

            // Notes
            if (notes) dataToSave.notes = notes;

            // JSON fields
            if (phoneNumbers && phoneNumbers.length > 0) {
                dataToSave.additionalPhones = phoneNumbers.filter(p => p);
            }
            if (emergencyContacts && emergencyContacts.length > 0) {
                dataToSave.emergencyContacts = emergencyContacts;
            }

            console.log('Saving user data:', dataToSave); // Debug log
            await onSave(dataToSave);
            onClose();
        } catch (error) {
            console.error('Failed to save user', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={user ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
            size="xl"
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Professional Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex gap-1 -mb-px" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'profile'}
                            className={`group relative px-6 py-3 text-sm font-medium transition-all duration-300 ease-out ${activeTab === 'profile'
                                ? 'text-primary'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">person</span>
                                Profil Bilgileri
                            </span>
                            <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform transition-all duration-300 ${activeTab === 'profile' ? 'scale-x-100' : 'scale-x-0'
                                }`} />
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'contact'}
                            className={`group relative px-6 py-3 text-sm font-medium transition-all duration-300 ease-out ${activeTab === 'contact'
                                ? 'text-primary'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            onClick={() => setActiveTab('contact')}
                        >
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">contact_phone</span>
                                İletişim
                            </span>
                            <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform transition-all duration-300 ${activeTab === 'contact' ? 'scale-x-100' : 'scale-x-0'
                                }`} />
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'address'}
                            className={`group relative px-6 py-3 text-sm font-medium transition-all duration-300 ease-out ${activeTab === 'address'
                                ? 'text-primary'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            onClick={() => setActiveTab('address')}
                        >
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">location_on</span>
                                Adres
                            </span>
                            <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform transition-all duration-300 ${activeTab === 'address' ? 'scale-x-100' : 'scale-x-0'
                                }`} />
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'prefs'}
                            className={`group relative px-6 py-3 text-sm font-medium transition-all duration-300 ease-out ${activeTab === 'prefs'
                                ? 'text-primary'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            onClick={() => setActiveTab('prefs')}
                        >
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">settings</span>
                                Tercihler
                            </span>
                            <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform transition-all duration-300 ${activeTab === 'prefs' ? 'scale-x-100' : 'scale-x-0'
                                }`} />
                        </button>
                    </nav>
                </div>

                {/* Profile Tab Content */}
                <div className={`space-y-6 transition-all duration-500 ease-out ${activeTab === 'profile' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute pointer-events-none'
                    }`}>
                    {/* Avatar Upload Section */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden flex items-center justify-center ring-2 ring-primary/20">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-primary/60">person</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 cursor-pointer text-sm transition-all hover:bg-primary/5">
                                <span className="material-symbols-outlined text-primary">upload</span>
                                <span className="font-medium">{avatarPreview ? 'Avatarı Değiştir' : 'Avatar Yükle'}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file && file.type.startsWith('image') && file.size <= 5 * 1024 * 1024) {
                                            setAvatarPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </label>
                            {avatarPreview && (
                                <button type="button" className="ml-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={() => setAvatarPreview(null)}>
                                    Kaldır
                                </button>
                            )}
                            <p className="text-xs text-gray-500 mt-2">Max 5MB, JPG veya PNG</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Ad"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            error={errors.firstName}
                            required
                        />
                        <FormField
                            label="Soyad"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            error={errors.lastName}
                            required
                        />
                    </div>

                    <FormField
                        label="E-posta"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={errors.email}
                        required
                    />

                    {!user && (
                        <FormField
                            label="Şifre"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            required
                            helperText="10+ karakter, büyük/küçük harf, rakam ve özel karakter"
                        />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Rol"
                            as="select"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                            options={[
                                { value: 'student', label: 'Öğrenci' },
                                { value: 'instructor', label: 'Eğitmen' },
                                { value: 'admin', label: 'Yönetici' },
                            ]}
                        />
                        <FormField
                            label="Telefon"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            error={errors.phone}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            label="Doğum Tarihi"
                            type="date"
                            value={formData.dateOfBirth ? new Date(formData.dateOfBirth as any).toISOString().slice(0, 10) : ''}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value ? e.target.value : undefined })}
                        />
                        <FormField
                            label="Unvan"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Şirket" value={company} onChange={(e) => setCompany(e.target.value)} />
                        <FormField label="Sektör" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                    </div>
                </div>

                {/* Contact Tab Content */}
                <div className={`space-y-6 transition-all duration-500 ease-out ${activeTab === 'contact' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute pointer-events-none'
                    }`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="İkinci E-posta" type="email" value={secondaryEmail} onChange={(e) => setSecondaryEmail(e.target.value)} error={errors.secondaryEmail} />
                        <FormField label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </div>

                    <FormField label="LinkedIn" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />

                    {/* Additional Phone Numbers */}
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">phone</span>
                                Ek Telefonlar
                            </h4>
                            <button type="button" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors" onClick={() => setPhoneNumbers(prev => [...prev, ''])}>
                                <span className="material-symbols-outlined text-[18px] align-middle">add</span> Ekle
                            </button>
                        </div>
                        {phoneNumbers.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input
                                    aria-label={`Ek Telefon ${idx + 1}`}
                                    className="flex-1 rounded-lg border bg-white dark:bg-gray-800 px-3 py-2 text-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/20"
                                    value={p}
                                    onChange={(e) => setPhoneNumbers(prev => prev.map((x, i) => i === idx ? e.target.value : x))}
                                    placeholder={`Telefon ${idx + 1}`}
                                />
                                <button type="button" className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" onClick={() => setPhoneNumbers(prev => prev.filter((_, i) => i !== idx))}>
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        ))}
                        {errors.phoneNumbers && <div role="alert" className="text-sm text-red-600">{errors.phoneNumbers}</div>}
                    </div>

                    {/* Emergency Contacts */}
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">emergency</span>
                                Acil Durum Kişileri
                            </h4>
                            <button type="button" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors" onClick={() => setEmergencyContacts(prev => [...prev, { name: '', phone: '', relationship: '' }])}>
                                <span className="material-symbols-outlined text-[18px] align-middle">add</span> Ekle
                            </button>
                        </div>
                        {emergencyContacts.map((c, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white dark:bg-gray-900/50 rounded-lg">
                                <FormField label="Ad" value={c.name} onChange={(e) => setEmergencyContacts(prev => prev.map((p, i) => i === idx ? { ...p, name: e.target.value } : p))} />
                                <FormField label="Telefon" value={c.phone} onChange={(e) => setEmergencyContacts(prev => prev.map((p, i) => i === idx ? { ...p, phone: e.target.value } : p))} />
                                <div className="flex items-end gap-2">
                                    <FormField label="İlişki" value={c.relationship || ''} onChange={(e) => setEmergencyContacts(prev => prev.map((p, i) => i === idx ? { ...p, relationship: e.target.value } : p))} />
                                    <button type="button" className="p-2 mb-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" onClick={() => setEmergencyContacts(prev => prev.filter((_, i) => i !== idx))}>
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <FormField label="Notlar" as="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                {/* Address Tab Content */}
                <div className={`space-y-6 transition-all duration-500 ease-out ${activeTab === 'address' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute pointer-events-none'
                    }`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Adres" value={formData.address!} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                        <FormField label="Posta Kodu" value={formData.postalCode!} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} error={errors.postalCode} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Sokak" value={street} onChange={(e) => setStreet(e.target.value)} />
                        <FormField label="Mahalle" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
                        <FormField label="İlçe" value={district} onChange={(e) => setDistrict(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Şehir" value={formData.city!} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                        <FormField label="Eyalet/İl" value={formData.state!} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                        <FormField label="Ülke" value={formData.country!} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                    </div>
                </div>

                {/* Preferences Tab Content */}
                <div className={`space-y-6 transition-all duration-500 ease-out ${activeTab === 'prefs' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute pointer-events-none'
                    }`}>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-4">
                        <h4 className="text-sm font-semibold mb-3">Bildirim Tercihleri</h4>
                        <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                            <input type="checkbox" checked={preferences.newsletter} onChange={(e) => setPreferences(prev => ({ ...prev, newsletter: e.target.checked }))} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                            <div className="flex-1">
                                <div className="font-medium text-sm">Haber Bülteni</div>
                                <div className="text-xs text-gray-500">Yeni kurslar ve güncellemeler hakkında bilgi alın</div>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                            <input type="checkbox" checked={preferences.smsNotifications} onChange={(e) => setPreferences(prev => ({ ...prev, smsNotifications: e.target.checked }))} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                            <div className="flex-1">
                                <div className="font-medium text-sm">SMS Bildirimleri</div>
                                <div className="text-xs text-gray-500">Önemli güncellemeler için SMS alın</div>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                            <input type="checkbox" checked={preferences.marketingOptIn} onChange={(e) => setPreferences(prev => ({ ...prev, marketingOptIn: e.target.checked }))} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                            <div className="flex-1">
                                <div className="font-medium text-sm">Pazarlama İzinleri</div>
                                <div className="text-xs text-gray-500">Özel teklifler ve kampanyalar hakkında bilgi alın</div>
                            </div>
                        </label>
                    </div>

                    <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg" style={transitionStyle(canSeeActiveToggle(visibilityCtx))} aria-hidden={!canSeeActiveToggle(visibilityCtx)}>
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className={`w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary ${baseTransitionClass()}`}
                        />
                        <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                            Aktif Kullanıcı
                        </label>
                    </div>

                    {user && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg" style={transitionStyle(canSeeTwoFactor(visibilityCtx))} aria-hidden={!canSeeTwoFactor(visibilityCtx)}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">İki Faktörlü Doğrulama</div>
                                    <div className="text-xs text-gray-500 mt-1">Hesap güvenliğinizi artırın</div>
                                </div>
                                {user.twoFactorEnabled ? (
                                    <Button variant="outline" onClick={async () => {
                                        await userManagementService.disable2FA(user.id);
                                    }}>Devre Dışı Bırak</Button>
                                ) : (
                                    <Button onClick={async () => {
                                        const secret = cryptoRandom();
                                        await userManagementService.enable2FA(user.id, secret);
                                    }}>Etkinleştir</Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </Modal>
    );
};
