import Joi from 'joi';
import { UserRole } from '../models/User.js';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz',
    'string.empty': 'E-posta adresi zorunludur',
    'any.required': 'E-posta adresi zorunludur'
  }),
  password: Joi.string().min(8).pattern(passwordRegex).required().messages({
    'string.min': 'Şifre en az 8 karakter olmalıdır',
    'string.pattern.base': 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir',
    'string.empty': 'Şifre zorunludur',
    'any.required': 'Şifre zorunludur'
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Ad en az 2 karakter olmalıdır',
    'string.max': 'Ad en fazla 50 karakter olabilir',
    'string.empty': 'Ad zorunludur',
    'any.required': 'Ad zorunludur'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Soyad en az 2 karakter olmalıdır',
    'string.max': 'Soyad en fazla 50 karakter olabilir',
    'string.empty': 'Soyad zorunludur',
    'any.required': 'Soyad zorunludur'
  }),
  phone: Joi.string().pattern(phoneRegex).optional().allow('').messages({
    'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
  }),
  role: Joi.string().valid(...Object.values(UserRole)).default(UserRole.STUDENT).messages({
    'any.only': 'Geçerli bir rol seçiniz'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz',
    'string.empty': 'E-posta adresi zorunludur',
    'any.required': 'E-posta adresi zorunludur'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Şifre zorunludur',
    'any.required': 'Şifre zorunludur'
  })
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz',
    'string.empty': 'E-posta adresi zorunludur',
    'any.required': 'E-posta adresi zorunludur'
  })
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token zorunludur',
    'any.required': 'Token zorunludur'
  }),
  password: Joi.string().min(8).pattern(passwordRegex).required().messages({
    'string.min': 'Şifre en az 8 karakter olmalıdır',
    'string.pattern.base': 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir',
    'string.empty': 'Şifre zorunludur',
    'any.required': 'Şifre zorunludur'
  })
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'string.empty': 'Mevcut şifre zorunludur',
    'any.required': 'Mevcut şifre zorunludur'
  }),
  newPassword: Joi.string().min(8).pattern(passwordRegex).required().messages({
    'string.min': 'Yeni şifre en az 8 karakter olmalıdır',
    'string.pattern.base': 'Yeni şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir',
    'string.empty': 'Yeni şifre zorunludur',
    'any.required': 'Yeni şifre zorunludur'
  })
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Ad en az 2 karakter olmalıdır',
    'string.max': 'Ad en fazla 50 karakter olabilir'
  }),
  lastName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Soyad en az 2 karakter olmalıdır',
    'string.max': 'Soyad en fazla 50 karakter olabilir'
  }),
  phone: Joi.string().pattern(phoneRegex).optional().allow('').messages({
    'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
  })
});

export const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz',
    'string.empty': 'E-posta adresi zorunludur',
    'any.required': 'E-posta adresi zorunludur'
  }),
  password: Joi.string().min(8).pattern(passwordRegex).required().messages({
    'string.min': 'Şifre en az 8 karakter olmalıdır',
    'string.pattern.base': 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir',
    'string.empty': 'Şifre zorunludur',
    'any.required': 'Şifre zorunludur'
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Ad en az 2 karakter olmalıdır',
    'string.max': 'Ad en fazla 50 karakter olabilir',
    'string.empty': 'Ad zorunludur',
    'any.required': 'Ad zorunludur'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Soyad en az 2 karakter olmalıdır',
    'string.max': 'Soyad en fazla 50 karakter olabilir',
    'string.empty': 'Soyad zorunludur',
    'any.required': 'Soyad zorunludur'
  }),
  phone: Joi.string().pattern(phoneRegex).optional().allow('').messages({
    'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
  }),
  role: Joi.string().valid(...Object.values(UserRole)).required().messages({
    'any.only': 'Geçerli bir rol seçiniz',
    'string.empty': 'Rol zorunludur',
    'any.required': 'Rol zorunludur'
  }),
  isActive: Joi.boolean().default(true)
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Ad en az 2 karakter olmalıdır',
    'string.max': 'Ad en fazla 50 karakter olabilir'
  }),
  lastName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Soyad en az 2 karakter olmalıdır',
    'string.max': 'Soyad en fazla 50 karakter olabilir'
  }),
  phone: Joi.string().pattern(phoneRegex).optional().allow('').messages({
    'string.pattern.base': 'Geçerli bir telefon numarası giriniz'
  }),
  role: Joi.string().valid(...Object.values(UserRole)).optional().messages({
    'any.only': 'Geçerli bir rol seçiniz'
  }),
  isActive: Joi.boolean().optional()
});

export const notificationSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Başlık en az 3 karakter olmalıdır',
    'string.max': 'Başlık en fazla 100 karakter olabilir',
    'string.empty': 'Başlık zorunludur',
    'any.required': 'Başlık zorunludur'
  }),
  message: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Mesaj en az 10 karakter olmalıdır',
    'string.max': 'Mesaj en fazla 500 karakter olabilir',
    'string.empty': 'Mesaj zorunludur',
    'any.required': 'Mesaj zorunludur'
  }),
  type: Joi.string().valid('success', 'error', 'warning', 'info').required().messages({
    'any.only': 'Geçerli bir bildirim tipi seçiniz',
    'string.empty': 'Bildirim tipi zorunludur',
    'any.required': 'Bildirim tipi zorunludur'
  }),
  priority: Joi.string().valid('low', 'medium', 'high').required().messages({
    'any.only': 'Geçerli bir öncelik seçiniz',
    'string.empty': 'Öncelik zorunludur',
    'any.required': 'Öncelik zorunludur'
  }),
  userId: Joi.number().integer().positive().required().messages({
    'number.base': 'Geçerli bir kullanıcı IDsi giriniz',
    'number.integer': 'Kullanıcı IDsi tam sayı olmalıdır',
    'number.positive': 'Kullanıcı IDsi pozitif olmalıdır',
    'any.required': 'Kullanıcı IDsi zorunludur'
  })
});

export const projectSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Proje adı en az 3 karakter olmalıdır',
    'string.max': 'Proje adı en fazla 100 karakter olabilir',
    'string.empty': 'Proje adı zorunludur',
    'any.required': 'Proje adı zorunludur'
  }),
  description: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Açıklama en az 10 karakter olmalıdır',
    'string.max': 'Açıklama en fazla 1000 karakter olabilir',
    'string.empty': 'Açıklama zorunludur',
    'any.required': 'Açıklama zorunludur'
  }),
  status: Joi.string().valid('planning', 'active', 'completed', 'on_hold', 'cancelled').required().messages({
    'any.only': 'Geçerli bir durum seçiniz',
    'string.empty': 'Durum zorunludur',
    'any.required': 'Durum zorunludur'
  }),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').required().messages({
    'any.only': 'Geçerli bir öncelik seçiniz',
    'string.empty': 'Öncelik zorunludur',
    'any.required': 'Öncelik zorunludur'
  }),
  startDate: Joi.date().iso().required().messages({
    'date.base': 'Geçerli bir başlangıç tarihi giriniz',
    'any.required': 'Başlangıç tarihi zorunludur'
  }),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
    'date.base': 'Geçerli bir bitiş tarihi giriniz',
    'date.greater': 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır',
    'any.required': 'Bitiş tarihi zorunludur'
  }),
  assignedTo: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.min': 'En az bir kullanıcı atanmalıdır',
    'number.base': 'Geçerli bir kullanıcı IDsi giriniz',
    'number.integer': 'Kullanıcı IDsi tam sayı olmalıdır',
    'number.positive': 'Kullanıcı IDsi pozitif olmalıdır',
    'any.required': 'Atanan kullanıcılar zorunludur'
  })
});

export const taskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Görev başlığı en az 3 karakter olmalıdır',
    'string.max': 'Görev başlığı en fazla 100 karakter olabilir',
    'string.empty': 'Görev başlığı zorunludur',
    'any.required': 'Görev başlığı zorunludur'
  }),
  description: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Açıklama en az 10 karakter olmalıdır',
    'string.max': 'Açıklama en fazla 500 karakter olabilir',
    'string.empty': 'Açıklama zorunludur',
    'any.required': 'Açıklama zorunludur'
  }),
  status: Joi.string().valid('todo', 'in_progress', 'review', 'done').required().messages({
    'any.only': 'Geçerli bir durum seçiniz',
    'string.empty': 'Durum zorunludur',
    'any.required': 'Durum zorunludur'
  }),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').required().messages({
    'any.only': 'Geçerli bir öncelik seçiniz',
    'string.empty': 'Öncelik zorunludur',
    'any.required': 'Öncelik zorunludur'
  }),
  dueDate: Joi.date().iso().min('now').required().messages({
    'date.base': 'Geçerli bir son tarih giriniz',
    'date.min': 'Son tarih bugünden sonra olmalıdır',
    'any.required': 'Son tarih zorunludur'
  }),
  assignedTo: Joi.number().integer().positive().required().messages({
    'number.base': 'Geçerli bir kullanıcı IDsi giriniz',
    'number.integer': 'Kullanıcı IDsi tam sayı olmalıdır',
    'number.positive': 'Kullanıcı IDsi pozitif olmalıdır',
    'any.required': 'Atanan kullanıcı zorunludur'
  }),
  projectId: Joi.number().integer().positive().required().messages({
    'number.base': 'Geçerli bir proje IDsi giriniz',
    'number.integer': 'Proje IDsi tam sayı olmalıdır',
    'number.positive': 'Proje IDsi pozitif olmalıdır',
    'any.required': 'Proje IDsi zorunludur'
  })
});