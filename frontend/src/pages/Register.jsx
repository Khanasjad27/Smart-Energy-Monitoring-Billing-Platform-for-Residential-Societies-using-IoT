import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, User, Mail, Lock, Building, MapPin, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
const ROLES = [
    { id: 'USER',          label: 'Resident',      desc: 'I live in a flat'              },
    { id: 'SOCIETY_ADMIN', label: 'Society Admin',  desc: 'I manage a society'            },
    { id: 'BUILDER_ADMIN', label: 'Builder Admin',  desc: 'I own/operate a builder group' },
];
const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('USER');
    const [builders, setBuilders] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '',
        name: '', location: '', address: '', builderId: ''
    });
    React.useEffect(() => {
        if (role === 'SOCIETY_ADMIN') {
            api.get('/builder').then(res => setBuilders(res.data)).catch(console.error);
        }
    }, [role]);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let endpoint = '/auth/register';
            let payload = { email: formData.email, password: formData.password, role };
            if (role === 'USER') {
                payload = { ...payload, firstName: formData.firstName, lastName: formData.lastName };
            } else if (role === 'BUILDER_ADMIN') {
                endpoint = '/builder/register';
                payload = { name: formData.name, location: formData.location, email: formData.email, password: formData.password };
            } else if (role === 'SOCIETY_ADMIN') {
                endpoint = '/society/register';
                payload = { name: formData.name, address: formData.address, builderId: Number(formData.builderId), email: formData.email, password: formData.password };
            }
            await api.post(endpoint, payload);
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg fade-up">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="p-1.5 bg-amber-400 rounded-lg">
                            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="font-extrabold text-stone-900 text-xl">
                            Watts<span className="text-amber-500">Up</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-extrabold text-stone-900">Create your account</h1>
                    <p className="text-stone-500 text-sm mt-1">Choose your role to get started.</p>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200 p-8"
                     style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                    <div className="grid grid-cols-3 gap-2 mb-7">
                        {ROLES.map(r => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => setRole(r.id)}
                                className={`flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all duration-150 ${
                                    role === r.id
                                        ? 'border-amber-400 bg-amber-50'
                                        : 'border-stone-200 hover:border-stone-300 bg-white'
                                }`}
                            >
                                <span className={`text-xs font-bold leading-tight ${role === r.id ? 'text-amber-700' : 'text-stone-700'}`}>
                                    {r.label}
                                </span>
                                <span className="text-[10px] text-stone-400 mt-0.5 leading-tight hidden sm:block">{r.desc}</span>
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {role === 'USER' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">First Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                                        <input name="firstName" type="text" required className="input-field pl-9"
                                               placeholder="Asjad" value={formData.firstName} onChange={handleChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Last Name</label>
                                    <input name="lastName" type="text" required className="input-field"
                                           placeholder="Khan" value={formData.lastName} onChange={handleChange} />
                                </div>
                            </div>
                        )}
                        {(role === 'BUILDER_ADMIN' || role === 'SOCIETY_ADMIN') && (
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                                    {role === 'BUILDER_ADMIN' ? 'Builder / Company Name' : 'Society Name'}
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                                    <input name="name" type="text" required className="input-field pl-9"
                                           placeholder={role === 'BUILDER_ADMIN' ? 'Apex Builders Pvt. Ltd.' : 'Greenwood Residency'}
                                           value={formData.name} onChange={handleChange} />
                                </div>
                            </div>
                        )}
                        {role === 'BUILDER_ADMIN' && (
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                                    <input name="location" type="text" required className="input-field pl-9"
                                           placeholder="Mumbai, Maharashtra" value={formData.location} onChange={handleChange} />
                                </div>
                            </div>
                        )}
                        {role === 'SOCIETY_ADMIN' && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Society Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                                        <input name="address" type="text" required className="input-field pl-9"
                                               placeholder="Andheri West, Mumbai" value={formData.address} onChange={handleChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Associated Builder</label>
                                    <select name="builderId" required className="input-field"
                                            value={formData.builderId} onChange={handleChange}>
                                        <option value="">Select builder…</option>
                                        {builders.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </>
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                                <input name="email" type="email" required className="input-field pl-9"
                                       placeholder="you@example.com" value={formData.email} onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                                <input name="password" type="password" required className="input-field pl-9"
                                       placeholder="Create a strong password" value={formData.password} onChange={handleChange} />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                                className="btn-primary w-full justify-center py-3 text-base mt-1">
                            {loading
                                ? <Loader2 className="h-5 w-5 animate-spin" />
                                : <><span>Create account</span><ArrowRight className="h-4 w-4" /></>
                            }
                        </button>
                    </form>
                    <p className="text-center text-sm text-stone-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-700">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
export default Register;
