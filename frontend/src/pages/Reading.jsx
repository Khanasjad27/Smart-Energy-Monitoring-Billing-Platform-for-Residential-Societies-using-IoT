import React, { useState, useEffect } from 'react';
import { Zap, Home, Plus, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getUser } from '../utils/auth';
const Reading = () => {
    const user = getUser();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [flats, setFlats] = useState([]);
    const [selectedFlat, setSelectedFlat] = useState('');
    const [societies, setSocieties] = useState([]);
    const [selectedSociety, setSelectedSociety] = useState('');
    const [unit, setUnit] = useState('');
    const [readings, setReadings] = useState([]);
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (user.role === 'USER') {
                    const res = await api.get('/flat');
                    if (res.data.length > 0) {
                        setFlats(res.data);
                        setSelectedFlat(res.data[0].id.toString());
                    }
                } else if (user.role === 'SOCIETY_ADMIN') {
                    const res = await api.get('/flat/society');
                    if (res.data.length > 0) {
                        setFlats(res.data);
                        // Default to first flat for reading view, not 'society' because reading history is per-flat
                        setSelectedFlat(res.data[0].id.toString());
                    }
                } else if (user.role === 'BUILDER_ADMIN') {
                    const socRes = await api.get('/society');
                    const socList = Array.isArray(socRes.data)
                        ? socRes.data
                        : (socRes.data?.allSocieties || []);
                    setSocieties(socList);
                    const flatRes = await api.get('/flat/all');
                    const flatList = Array.isArray(flatRes.data) ? flatRes.data : [];
                    setFlats(flatList);
                    if (socList.length > 0) {
                        setSelectedSociety(socList[0].id.toString());
                        const firstSocFlat = flatList.find(f => f.societyId === socList[0].id);
                        if (firstSocFlat) {
                            setSelectedFlat(firstSocFlat.id.toString());
                        } else {
                            // No flats yet, but still clear the page loading state
                            setSelectedFlat('');
                        }
                    } else {
                        setSelectedFlat('');
                    }
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
                toast.error('Failed to load flats');
            } finally {
                setPageLoading(false);
            }
        };
        fetchInitialData();
    }, [user.role]);
    const handleSocietyChange = (e) => {
        const socId = e.target.value;
        setSelectedSociety(socId);
        // When society changes, select the first flat in that society
        const firstSocFlat = flats.find(f => f.societyId.toString() === socId);
        if (firstSocFlat) {
            setSelectedFlat(firstSocFlat.id.toString());
        } else {
            setSelectedFlat('');
        }
    };
    useEffect(() => {
        if (!selectedFlat) return;
        const fetchReadings = async () => {
            try {
                const res = await api.get(`/reading/${selectedFlat}`);
                setReadings(res.data.allReadings || res.data);
            } catch (error) {
                console.error('Error fetching readings:', error);
            }
        };
        fetchReadings();
    }, [selectedFlat]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFlat || !unit) {
            toast.error('Please select a flat and enter units');
            return;
        }
        setLoading(true);
        try {
            await api.post('/reading', {
                flatId: Number(selectedFlat),
                unit: Number(unit)
            });
            toast.success('Reading added successfully!');
            setUnit('');
            // Auto trigger billing logic
            try {
                await api.get(`/billing/${selectedFlat}`);
                toast.success('Bill generated successfully!');
            } catch (err) {
                console.log('Bill generation error or already generated', err);
            }
            // Refresh readings
            const res = await api.get(`/reading/${selectedFlat}`);
            setReadings(res.data.allReadings || res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add reading');
        } finally {
            setLoading(false);
        }
    };
    if (pageLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        );
    }
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Meter Readings</h1>
                    <p className="text-slate-500 text-sm mt-1">Record and track energy meter readings.</p>
                </div>
                {user.role === 'BUILDER_ADMIN' && (
                    <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Home className="h-4 w-4" />
                        </div>
                        <select
                            className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
                            value={selectedSociety}
                            onChange={handleSocietyChange}
                        >
                            <option value="" disabled>Select Society</option>
                            {societies.map(soc => (
                                <option key={soc.id} value={soc.id}>
                                    {soc.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {user.role !== 'USER' && (
                    <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Zap className="h-4 w-4" />
                        </div>
                        <select
                            className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
                            value={selectedFlat}
                            onChange={(e) => setSelectedFlat(e.target.value)}
                        >
                            <option value="" disabled>Select a flat</option>
                            {flats
                                .filter(f => user.role === 'BUILDER_ADMIN' ? f.societyId.toString() === selectedSociety : true)
                                .map(flat => (
                                <option key={flat.id} value={flat.id}>
                                    Flat {flat.flatNumber} (Floor {flat.floor})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {user.role === 'USER' && (
                    <div className="md:col-span-1 space-y-6">
                        <div className="card">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Add New Reading</h3>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Flat</label>
                                    <select
                                        className="input-field bg-slate-100"
                                        value={selectedFlat}
                                        onChange={(e) => setSelectedFlat(e.target.value)}
                                        required
                                        disabled={flats.length === 1}
                                    >
                                        {flats.map(flat => (
                                            <option key={flat.id} value={flat.id}>
                                                Flat {flat.flatNumber} (Floor {flat.floor})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Meter Units</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Zap className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            required
                                            className="input-field pl-9"
                                            placeholder="Enter total units"
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-slate-400 text-sm">kWh</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !selectedFlat}
                                    className="w-full flex justify-center items-center gap-2 btn-primary py-2.5 mt-2"
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                    Submit Reading
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                <div className={user.role === 'USER' ? "md:col-span-2" : "md:col-span-3"}>
                    <div className="card h-full">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Reading History</h3>
                        {readings.length > 0 ? (
                            <div className="overflow-hidden rounded-xl border border-slate-100">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50">
                                        <tr className="border-b border-slate-100 text-slate-500 text-sm">
                                            <th className="py-3 px-4 font-medium">Date & Time</th>
                                            <th className="py-3 px-4 font-medium">Meter Reading</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {readings.slice().reverse().map((r) => (
                                            <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-3 px-4 text-sm text-slate-600">
                                                    {new Date(r.createdAt).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-semibold text-slate-900">{r.unit}</span>
                                                    <span className="text-xs text-slate-500 ml-1">kWh</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Zap className="h-12 w-12 text-slate-200 mb-3" />
                                <p className="text-slate-500 font-medium">No readings found</p>
                                <p className="text-sm text-slate-400 mt-1">Submit your first reading using the form.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Reading;
