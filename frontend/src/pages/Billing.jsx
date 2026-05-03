import React, { useState, useEffect } from 'react';
import { IndianRupee, FileText, Download, Loader2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getUser } from '../utils/auth';
const Billing = () => {
    const user = getUser();
    const [loading, setLoading] = useState(true);
    const [flats, setFlats] = useState([]);
    const [selectedFlat, setSelectedFlat] = useState('');
    const [bills, setBills] = useState([]);
    const [societies, setSocieties] = useState([]);
    const [selectedSociety, setSelectedSociety] = useState('');
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
                        setSelectedFlat('society');
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
                    setSelectedSociety('all');
                    setSelectedFlat('builder');
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
                toast.error('Failed to load data');
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
        const fetchBills = async () => {
            try {
                const res = await api.get(`/billing/history/${selectedFlat}`);
                setBills(res.data);
            } catch (error) {
                console.error('Error fetching bills:', error);
            }
        };
        fetchBills();
    }, [selectedFlat]);
    const handleDownloadBill = (bill) => {
        const flat = flats.find(f => f.id.toString() === selectedFlat);
        const billDate = new Date(bill.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const invoiceContent = `=========================================
          SMART ENERGY IOT
          ENERGY BILL INVOICE
=========================================
Date Generated: ${billDate}
Status: Generated
-----------------------------------------
CUSTOMER DETAILS
-----------------------------------------
Flat Number: ${flat ? flat.flatNumber : 'All Flats Summary'}
Floor: ${flat ? flat.floor : 'Multiple'}
-----------------------------------------
USAGE DETAILS
-----------------------------------------
Units Consumed: ${bill.units} kWh
Total Amount Due: Rs. ${bill.amount}
=========================================
Thank you for using Smart Energy IoT.
=========================================`;
        const blob = new Blob([invoiceContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Energy_Bill_Flat${flat?.flatNumber}_${billDate.replace(/[\s,]+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Bill downloaded successfully!');
    };
    if (loading && flats.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        );
    }
    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Billing & Invoices</h1>
                    <p className="text-slate-500 text-sm mt-1">View your monthly energy bills and payment history.</p>
                </div>
                {user.role === 'BUILDER_ADMIN' && (
                    <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <FileText className="h-4 w-4" />
                        </div>
                        <select
                            className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
                            value={selectedSociety}
                            onChange={handleSocietyChange}
                        >
                            <option value="all">All Societies Summary</option>
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
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <FileText className="h-4 w-4" />
                        </div>
                        <select
                            className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
                            value={selectedFlat}
                            onChange={(e) => setSelectedFlat(e.target.value)}
                        >
                            {user.role === 'BUILDER_ADMIN' && selectedSociety === 'all' && (
                                <option value="builder">System Wide Summary</option>
                            )}
                            {user.role === 'BUILDER_ADMIN' && selectedSociety !== 'all' && (
                                <option value={`society_${selectedSociety}`}>All Flats Summary</option>
                            )}
                            {user.role === 'SOCIETY_ADMIN' && (
                                <option value="society">All Flats Summary</option>
                            )}
                            {flats
                                .filter(f => user.role === 'BUILDER_ADMIN' && selectedSociety !== 'all' ? f.societyId.toString() === selectedSociety : true)
                                .map(flat => (
                                    <option key={flat.id} value={flat.id}>
                                        Flat {flat.flatNumber} (Floor {flat.floor})
                                    </option>
                                ))}
                        </select>
                    </div>
                )}
            </div>
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Billing History</h3>
                </div>
                {bills.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-100 text-slate-500 text-sm">
                                    <th className="py-4 px-4 font-medium">Billing Date</th>
                                    <th className="py-4 px-4 font-medium">Units Consumed</th>
                                    <th className="py-4 px-4 font-medium">Total Amount</th>
                                    <th className="py-4 px-4 font-medium">Status</th>
                                    <th className="py-4 px-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {bills.slice().reverse().map((bill) => (
                                    <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-900">
                                                    {new Date(bill.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm font-semibold text-slate-700">{bill.units}</span>
                                            <span className="text-xs text-slate-500 ml-1">kWh</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center text-slate-900 font-bold">
                                                <IndianRupee className="h-4 w-4 mr-0.5 text-slate-400" />
                                                {bill.amount}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                Generated
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() => handleDownloadBill(bill)}
                                                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
                                            >
                                                <Download className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <FileText className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No bills generated yet</h3>
                        <p className="text-slate-500">Bills will appear here once meter readings are submitted.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Billing;
