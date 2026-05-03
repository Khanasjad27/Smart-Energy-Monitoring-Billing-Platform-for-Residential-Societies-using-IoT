import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
const ROLE_LABELS = {
    USER:          { label: 'Resident',      color: 'badge-stone' },
    SOCIETY_ADMIN: { label: 'Society Admin', color: 'badge-amber' },
    BUILDER_ADMIN: { label: 'Builder Admin', color: 'badge-green' },
};
const Profile = () => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving]   = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '' });
    useEffect(() => {
        api.get('/auth/me')
            .then(res => {
                setUser(res.data);
                setFormData({ firstName: res.data.firstName || '', lastName: res.data.lastName || '' });
            })
            .catch(() => toast.error('Failed to load profile'))
            .finally(() => setLoading(false));
    }, []);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/auth/update', formData);
            setUser({ ...user, ...formData });
            toast.success('Profile updated!');
            setTimeout(() => window.location.reload(), 800);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };
    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 text-amber-500 animate-spin" />
        </div>
    );
    const roleInfo = ROLE_LABELS[user?.role] || ROLE_LABELS.USER;
    const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}` || 'U';
    return (
        <div className="max-w-2xl mx-auto fade-up">
            <div className="mb-7">
                <h1 className="text-2xl font-extrabold text-stone-900">My Profile</h1>
                <p className="text-stone-500 text-sm mt-1">Manage your personal information.</p>
            </div>
            <div className="card mb-5 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-white flex items-center justify-center text-2xl font-extrabold shadow-md flex-shrink-0">
                    {initials}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-stone-900">{user?.firstName} {user?.lastName}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <Shield className="h-3.5 w-3.5 text-stone-400" />
                        <span className={`badge ${roleInfo.color}`}>{roleInfo.label}</span>
                    </div>
                </div>
            </div>
            <div className="card">
                <h3 className="font-bold text-stone-800 mb-5">Personal Details</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">First Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                                <input
                                    type="text" name="firstName"
                                    className="input-field pl-9"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Last Name</label>
                            <input type="text" name="lastName"
                                   className="input-field" value={formData.lastName} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                            <input
                                type="email" disabled
                                className="input-field pl-9 cursor-not-allowed opacity-60"
                                value={user?.email || ''}
                            />
                        </div>
                        <p className="text-xs text-stone-400 mt-1.5">Email address cannot be changed.</p>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={saving} className="btn-primary">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default Profile;
