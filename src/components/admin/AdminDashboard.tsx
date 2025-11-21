import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Activity, Calendar, Filter } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';

interface DashboardStats {
  totalUsers: number;
  totalSales: number;
  totalRevenue: number;
  activeUsers: number;
  userGrowth: number;
  salesGrowth: number;
  revenueGrowth: number;
  activeUserGrowth: number;
}

interface ChartData {
  name: string;
  value: number;
  date?: string;
}

const salesData = [
  { name: 'Ocak', value: 1200, date: '2024-01' },
  { name: 'Şubat', value: 1900, date: '2024-02' },
  { name: 'Mart', value: 800, date: '2024-03' },
  { name: 'Nisan', value: 1600, date: '2024-04' },
  { name: 'Mayıs', value: 2200, date: '2024-05' },
  { name: 'Haziran', value: 2800, date: '2024-06' },
  { name: 'Temmuz', value: 3200, date: '2024-07' },
];

const categoryData = [
  { name: 'Web Geliştirme', value: 35, color: '#3B82F6' },
  { name: 'Mobil Uygulama', value: 25, color: '#8B5CF6' },
  { name: 'Veri Bilimi', value: 20, color: '#10B981' },
  { name: 'Tasarım', value: 15, color: '#F59E0B' },
  { name: 'Diğer', value: 5, color: '#6B7280' },
];

const recentSales = [
  { id: '#876342', customer: 'Ahmet Yılmaz', course: 'Modern Web Geliştirme', date: '15.07.2024', amount: 299.99, status: 'success' },
  { id: '#876341', customer: 'Zeynep Kaya', course: 'Dijital Pazarlama Uzmanlığı', date: '15.07.2024', amount: 450.00, status: 'success' },
  { id: '#876340', customer: 'Can Öztürk', course: 'UX/UI Tasarım Temelleri', date: '14.07.2024', amount: 199.50, status: 'cancelled' },
  { id: '#876339', customer: 'Elif Demir', course: 'Veri Bilimi ve Python', date: '14.07.2024', amount: 750.00, status: 'success' },
  { id: '#876338', customer: 'Mehmet Şahin', course: 'React Native Mobil Geliştirme', date: '13.07.2024', amount: 599.00, status: 'success' },
];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 12450,
    totalSales: 1820,
    totalRevenue: 250780,
    activeUsers: 3120,
    userGrowth: 5.2,
    salesGrowth: 8.1,
    revenueGrowth: 12.5,
    activeUserGrowth: -1.8,
  });

  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 5),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3),
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    addNotification({
      title: 'Tarih Aralığı Güncellendi',
      message: `Veriler ${period} dönemine göre güncellendi.`,
      type: 'info',
      priority: 'low',
    });
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    growth: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, growth, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          growth >= 0 ? 'text-emerald-600' : 'text-red-600'
        }`}>
          {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(growth)}%
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Genel Bakış</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Platform performansınızı görüntüleyin</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Takvim</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filtre</span>
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {[
          { value: '7d', label: 'Son 7 Gün' },
          { value: '30d', label: 'Son 30 Gün' },
          { value: '90d', label: 'Son 90 Gün' },
          { value: 'custom', label: 'Özel Aralık' },
        ].map((period) => (
          <button
            key={period.value}
            onClick={() => handlePeriodChange(period.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === period.value
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats.totalUsers.toLocaleString()}
          growth={stats.userGrowth}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100 dark:bg-blue-900/20"
        />
        <StatCard
          title="Toplam Satış"
          value={stats.totalSales.toLocaleString()}
          growth={stats.salesGrowth}
          icon={<ShoppingCart className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100 dark:bg-purple-900/20"
        />
        <StatCard
          title="Toplam Gelir"
          value={`₺${stats.totalRevenue.toLocaleString()}`}
          growth={stats.revenueGrowth}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          color="bg-green-100 dark:bg-green-900/20"
        />
        <StatCard
          title="Aktif Kullanıcı"
          value={stats.activeUsers.toLocaleString()}
          growth={stats.activeUserGrowth}
          icon={<Activity className="w-6 h-6 text-orange-600" />}
          color="bg-orange-100 dark:bg-orange-900/20"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Satış Trendi</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Satışlar</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Kategori Dağılımı</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Son Satışlar</h3>
            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              Tümünü Gör
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sipariş ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Eğitim Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {sale.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {sale.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {sale.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {sale.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    ₺{sale.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sale.status === 'success'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {sale.status === 'success' ? 'Başarılı' : 'İptal Edildi'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};