import React, { useState, useEffect } from 'react';
import { Zap, Calendar, IndianRupee, Loader2, Home, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { getUser } from '../utils/auth';
const Dashboard = () => {
    const user = getUser();
    const [loading, setLoading] = useState(true);
    const [flats, setFlats] = useState([]);
    const [selectedFlat, setSelectedFlat] = useState('');
    const [societies, setSocieties] = useState([]);
    const [selectedSociety, setSelectedSociety] = useState('');
    const [summary, setSummary] = useState(null);
    const [dailyUsage, setDailyUsage] = useState([]);
    const [monthlyUsage, setMonthlyUsage] = useState([]);
    const [breakdown, setBreakdown] = useState([]);
    const [todayUsage, setTodayUsage] = useState(0);
    const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1'];
    // Fetch flats for admins, or just use the user's flat
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (user.role === 'USER') {
                    const res = await api.get('/flat'); // User's flats
                    if (res.data.length > 0) {
                        setFlats(res.data);
                        setSelectedFlat(res.data[0].id.toString());
                    }
                } else if (user.role === 'SOCIETY_ADMIN') {
                    const res = await api.get('/flat/society');
                    if (res.data.length > 0) {
                        setFlats(res.data);
                        setSelectedFlat('society');
                    }
                } else if (user.role === 'BUILDER_ADMIN') {
                    const socRes = await api.get('/society');
                    // API may return plain array OR { allSocieties: [] }
                    const socList = Array.isArray(socRes.data)
                        ? socRes.data
                        : (socRes.data?.allSocieties || []);
                    setSocieties(socList);
                    const flatRes = await api.get('/flat/all');
                    const flatList = Array.isArray(flatRes.data) ? flatRes.data : [];
                    setFlats(flatList);
                    // Always set a flat target so the data-fetch useEffect triggers
                    setSelectedSociety('all');
                    setSelectedFlat('builder');
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [user.role]);
    const handleSocietyChange = (e) => {
        const socId = e.target.value;
        setSelectedSociety(socId);
        if (socId === 'all') {
            setSelectedFlat('builder');
        } else {
            setSelectedFlat(`society_${socId}`);
        }
    };
    useEffect(() => {
        if (!selectedFlat) return;
        const fetchDashboardData = async () => {
            setLoading(true);
            // Reset stale data so UI always reflects the new selection
            setSummary(null);
            setDailyUsage([]);
            setMonthlyUsage([]);
            setTodayUsage(0);
            setBreakdown([{ name: 'No Data', value: 1 }]);
            try {
                const [summaryRes, dailyRes, monthlyRes, todayRes, breakdownRes] = await Promise.all([
                    api.get(`/dashboard/${selectedFlat}`),
                    api.get(`/dashboard/daily/${selectedFlat}`),
                    api.get(`/dashboard/monthly/${selectedFlat}`),
                    api.get(`/dashboard/today/${selectedFlat}`),
                    api.get(`/dashboard/breakdown/${selectedFlat}`)
                ]);
                setSummary(summaryRes.data);
                setDailyUsage(Array.isArray(dailyRes.data) ? dailyRes.data : []);
                setMonthlyUsage(Array.isArray(monthlyRes.data) ? monthlyRes.data : []);
                setTodayUsage(typeof todayRes.data === 'number' ? todayRes.data : 0);
                const bd = breakdownRes.data || {};
                const pieData = [
                    { name: 'Morning', value: bd.morning || 0 },
                    { name: 'Afternoon', value: bd.afternoon || 0 },
                    { name: 'Evening', value: bd.evening || 0 },
                    { name: 'Night', value: bd.night || 0 }
                ].filter(d => d.value > 0);
                setBreakdown(pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }]);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [selectedFlat]);
    if (loading && !selectedFlat) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        );
    }
    if (flats.length === 0 && user.role === 'USER') {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
                    <Home className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Flats Found</h2>
                    <p className="text-slate-500 mb-6">
                        You don't have any flats assigned to your account yet.
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-stone-900">Energy Overview</h1>
                    <p className="text-stone-500 text-sm mt-1">Here's how your energy is looking today.</p>
                </div>
                {user.role === 'BUILDER_ADMIN' && (
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-sm">
                        <Home className="h-4 w-4 text-amber-500" />
                        <select
                            className="bg-transparent text-sm font-semibold text-stone-700 focus:outline-none cursor-pointer"
                            value={selectedSociety}
                            onChange={handleSocietyChange}
                        >
                            <option value="all">All Societies</option>
                            {societies.map(soc => (
                                <option key={soc.id} value={soc.id}>{soc.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                {user.role !== 'USER' && (
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-sm">
                        <Home className="h-4 w-4 text-stone-400" />
                        <select
                            className="bg-transparent text-sm font-semibold text-stone-700 focus:outline-none cursor-pointer"
                            value={selectedFlat}
                            onChange={(e) => setSelectedFlat(e.target.value)}
                        >
                            {user.role === 'BUILDER_ADMIN' && selectedSociety === 'all' && (
                                <option value="builder">System-wide Summary</option>
                            )}
                            {user.role === 'BUILDER_ADMIN' && selectedSociety !== 'all' && (
                                <option value={`society_${selectedSociety}`}>All Flats</option>
                            )}
                            {user.role === 'SOCIETY_ADMIN' && (
                                <option value="society">All Flats</option>
                            )}
                            {flats
                                .filter(f => user.role === 'BUILDER_ADMIN' && selectedSociety !== 'all' ? f.societyId.toString() === selectedSociety : true)
                                .map(flat => (
                                    <option key={flat.id} value={flat.id}>
                                        Flat {flat.flatNumber} — Floor {flat.floor}
                                    </option>
                                ))}
                        </select>
                    </div>
                )}
            </div>
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-7 w-7 text-amber-500 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="card">
                            <p className="text-sm text-gray-500">Today's Usage</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{todayUsage} <span className="text-lg font-normal text-gray-400">kWh</span></h3>
                            <p className="text-xs text-gray-400 mt-3">Live tracking</p>
                        </div>
                        <div className="card">
                            <p className="text-sm text-gray-500">This Month</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{summary?.totalUnits || 0} <span className="text-lg font-normal text-gray-400">kWh</span></h3>
                            <p className="text-xs text-gray-400 mt-3">From meter readings</p>
                        </div>
                        <div className="card">
                            <p className="text-sm text-gray-500">Bill This Month</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">₹{summary?.totalAmount || 0}</h3>
                            <p className="text-xs text-gray-400 mt-3">Based on current readings</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="card lg:col-span-2">
                            <h3 className="text-base font-semibold text-gray-800 mb-4">Daily Usage</h3>
                            <div className="h-[260px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dailyUsage} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="units"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="card">
                            <h3 className="text-base font-semibold text-gray-800 mb-4">Usage Breakdown</h3>
                            <div className="h-[300px] flex flex-col items-center justify-center">
                                {breakdown[0]?.name === 'No Data' ? (
                                    <div className="text-center text-slate-400">
                                        <PieChart className="mx-auto mb-2 opacity-20" />
                                        <p>No breakdown data today</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={breakdown}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {breakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => [`${value} kWh`, 'Usage']}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Monthly Consumption</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyUsage} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="units" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Daily Records</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 text-gray-500 text-sm">
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Consumption (kWh)</th>
                                        <th className="pb-3 font-medium">Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dailyUsage.slice().reverse().slice(0, 5).map((day, idx, arr) => {
                                        const prev = arr[idx + 1];
                                        const isUp = prev && day.units > prev.units;
                                        const isDown = prev && day.units < prev.units;
                                        return (
                                            <tr key={day.date} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 text-sm text-gray-700">
                                                    {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="py-3 text-sm font-semibold text-gray-900">{day.units}</td>
                                                <td className="py-3">
                                                    {isUp ? (
                                                        <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">▲ Higher</span>
                                                    ) : isDown ? (
                                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">▼ Lower</span>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Stable</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {dailyUsage.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="py-6 text-center text-gray-400 text-sm">No records yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
export default Dashboard;
