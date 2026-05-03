import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { setToken, setUser } from '../utils/auth';
const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/login', formData);
            setToken(response.data.token);
            setUser(response.data.user);
            toast.success('Logged in successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="p-1.5 bg-amber-400 rounded-lg">
                            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="font-extrabold text-stone-900 text-xl">
                            Watts<span className="text-amber-500">Up</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-extrabold text-stone-900">Welcome back</h1>
                    <p className="text-stone-500 text-sm mt-1">Sign in to your account to continue.</p>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200 p-8"
                     style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                                <input
                                    name="email" type="email" required
                                    className="input-field pl-9"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                                <input
                                    name="password" type="password" required
                                    className="input-field pl-9"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3 text-base mt-1"
                        >
                            {loading
                                ? <Loader2 className="h-5 w-5 animate-spin" />
                                : <><span>Sign in</span><ArrowRight className="h-4 w-4" /></>
                            }
                        </button>
                    </form>
                    <p className="text-center text-sm text-stone-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-amber-600 hover:text-amber-700">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
export default Login;
