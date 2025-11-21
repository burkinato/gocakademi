import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, LogIn } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Erişim Reddedildi
          </h1>
          
          <p className="text-gray-600 mb-8">
            Bu sayfaya erişim yetkiniz bulunmamaktadır. Giriş yapmamış veya gerekli izinlere sahip değilseniz, lütfen hesabınızla giriş yapın veya sistem yöneticinizle iletişime geçin.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="w-4 h-4 mr-2" />
              Ana Sayfa
            </Link>
            
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Giriş Yap
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Hata Kodu: 403 - FORBIDDEN
          </p>
        </div>
      </div>
    </div>
  );
};