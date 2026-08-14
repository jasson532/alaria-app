import { useEffect, useState } from 'react';
import { Building2, Users, Calendar, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { supabase } from 'modules/shared/services/supabase';
import './DashboardPage.scss';

interface DashboardStats {
  totalProperties: number;
  totalUsers: number;
  pendingAppointments: number;
  completedVisits: number;
}

interface ChartItem {
  name: string;
  value: number;
}

const COLORS = ['#0B1E24', '#1a4a56', '#2d7a8a', '#4db3c4', '#8dd4e0', '#c7cdd1'];
const PIE_COLORS = ['#0B1E24', '#1a4a56', '#2d7a8a', '#4db3c4'];

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({ totalProperties: 0, totalUsers: 0, pendingAppointments: 0, completedVisits: 0 });
  const [transactionData, setTransactionData] = useState<ChartItem[]>([]);
  const [localityData, setLocalityData] = useState<ChartItem[]>([]);
  const [appointmentStatusData, setAppointmentStatusData] = useState<ChartItem[]>([]);
  const [priceRangeData, setPriceRangeData] = useState<ChartItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartItem[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    await Promise.all([loadStats(), loadTransactionChart(), loadLocalityChart(), loadAppointmentChart(), loadPriceChart(), loadMonthlyChart()]);
  };

  const loadStats = async () => {
    const [propRes, usersRes, pendingRes, completedRes] = await Promise.all([
      supabase.from('house_properties').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('house_users').select('id', { count: 'exact', head: true }),
      supabase.from('house_appointments').select('id, house_appointment_states!inner(name)', { count: 'exact', head: true }).eq('house_appointment_states.name', 'Pendiente'),
      supabase.from('house_appointments').select('id, house_appointment_states!inner(name)', { count: 'exact', head: true }).eq('house_appointment_states.name', 'Completada'),
    ]);
    setStats({
      totalProperties: propRes.count || 0,
      totalUsers: usersRes.count || 0,
      pendingAppointments: pendingRes.count || 0,
      completedVisits: completedRes.count || 0,
    });
  };

  const loadTransactionChart = async () => {
    const { data } = await supabase.from('house_properties').select('house_transaction_types(name)').eq('is_active', true);
    if (!data) return;
    const counts: Record<string, number> = {};
    data.forEach((p) => {
      const name = (p.house_transaction_types as unknown as { name: string })?.name || 'Otro';
      counts[name] = (counts[name] || 0) + 1;
    });
    setTransactionData(Object.entries(counts).map(([name, value]) => ({ name, value })));
  };

  const loadLocalityChart = async () => {
    const { data } = await supabase.from('house_properties').select('house_localities(name)').eq('is_active', true);
    if (!data) return;
    const counts: Record<string, number> = {};
    data.forEach((p) => {
      const name = (p.house_localities as unknown as { name: string })?.name || 'Otra';
      counts[name] = (counts[name] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    setLocalityData(sorted.map(([name, value]) => ({ name, value })));
  };

  const loadAppointmentChart = async () => {
    const { data } = await supabase.from('house_appointments').select('house_appointment_states(name)');
    if (!data) return;
    const counts: Record<string, number> = {};
    data.forEach((a) => {
      const name = (a.house_appointment_states as unknown as { name: string })?.name || 'Otro';
      counts[name] = (counts[name] || 0) + 1;
    });
    setAppointmentStatusData(Object.entries(counts).map(([name, value]) => ({ name, value })));
  };

  const loadPriceChart = async () => {
    const { data } = await supabase.from('house_properties').select('price').eq('is_active', true);
    if (!data) return;
    const ranges = [
      { name: '< 200M', min: 0, max: 200000000 },
      { name: '200-400M', min: 200000000, max: 400000000 },
      { name: '400-600M', min: 400000000, max: 600000000 },
      { name: '600-800M', min: 600000000, max: 800000000 },
      { name: '> 800M', min: 800000000, max: Infinity },
    ];
    const result = ranges.map((r) => ({
      name: r.name,
      value: data.filter((p) => p.price >= r.min && p.price < r.max).length,
    }));
    setPriceRangeData(result.filter((r) => r.value > 0));
  };

  const loadMonthlyChart = async () => {
    const { data } = await supabase.from('house_properties').select('created_at').eq('is_active', true);
    if (!data) return;
    const months: Record<string, number> = {};
    data.forEach((p) => {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + 1;
    });
    const sorted = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
    setMonthlyData(sorted.map(([name, value]) => ({ name, value })));
  };

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page__title"></h1>

      {/* Stats cards */}
      <div className="dashboard-page__stats">
        <div className="dashboard-page__stat-card">
          <div className="dashboard-page__stat-icon dashboard-page__stat-icon--primary"><Building2 size={22} /></div>
          <div className="dashboard-page__stat-info">
            <span className="dashboard-page__stat-value">{stats.totalProperties}</span>
            <span className="dashboard-page__stat-label">Inmuebles</span>
          </div>
        </div>
        <div className="dashboard-page__stat-card">
          <div className="dashboard-page__stat-icon dashboard-page__stat-icon--secondary"><Users size={22} /></div>
          <div className="dashboard-page__stat-info">
            <span className="dashboard-page__stat-value">{stats.totalUsers}</span>
            <span className="dashboard-page__stat-label">Usuarios</span>
          </div>
        </div>
        <div className="dashboard-page__stat-card">
          <div className="dashboard-page__stat-icon dashboard-page__stat-icon--warning"><Calendar size={22} /></div>
          <div className="dashboard-page__stat-info">
            <span className="dashboard-page__stat-value">{stats.pendingAppointments}</span>
            <span className="dashboard-page__stat-label">Citas Pendientes</span>
          </div>
        </div>
        <div className="dashboard-page__stat-card">
          <div className="dashboard-page__stat-icon dashboard-page__stat-icon--success"><TrendingUp size={22} /></div>
          <div className="dashboard-page__stat-info">
            <span className="dashboard-page__stat-value">{stats.completedVisits}</span>
            <span className="dashboard-page__stat-label">Visitas Completadas</span>
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="dashboard-page__charts-row">
        {/* Donut: Tipo de transacción */}
        <div className="dashboard-page__chart-card">
          <h3 className="dashboard-page__chart-title">Tipo de Negocio</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={transactionData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                {transactionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Donut: Estados de cita */}
        <div className="dashboard-page__chart-card">
          <h3 className="dashboard-page__chart-title">Estado de Citas</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={appointmentStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                {appointmentStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="dashboard-page__charts-row">
        {/* Barras: Por localidad */}
        <div className="dashboard-page__chart-card dashboard-page__chart-card--wide">
          <h3 className="dashboard-page__chart-title">Inmuebles por Localidad</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={localityData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e7e9" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0B1E24" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 3 */}
      <div className="dashboard-page__charts-row">
        {/* Barras: Rango de precios */}
        <div className="dashboard-page__chart-card">
          <h3 className="dashboard-page__chart-title">Rango de Precios</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priceRangeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e7e9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1a4a56" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Línea: Registros por mes */}
        <div className="dashboard-page__chart-card">
          <h3 className="dashboard-page__chart-title">Registros por Mes</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e7e9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0B1E24" strokeWidth={2.5} dot={{ fill: '#0B1E24', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
