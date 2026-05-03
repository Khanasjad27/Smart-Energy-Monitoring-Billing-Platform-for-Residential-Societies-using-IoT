import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, User, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { getUser, logout } from '../utils/auth';
const Navbar = () => {
    const user = getUser();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const isActive = (path) => location.pathname === path;
    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Billing', path: '/billing' },
        { name: 'Readings', path: '/reading' },
    ];
    const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}` || 'U';
    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-600 rounded-lg">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-gray-900 text-lg"><span className="font-extrabold text-stone-900 text-xl">
                            Watts<span className="text-amber-500">Up</span>
                        </span></span>
                    </Link>
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <div className="hidden md:flex items-center relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                                {initials}
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden lg:block">{user?.firstName}</span>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                                <div className="absolute right-0 top-11 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-20">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <User className="h-4 w-4 text-gray-400" /> Profile
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut className="h-4 w-4" /> Sign out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
                    {navLinks.map(link => (
                        <Link key={link.path} to={link.path}
                            className={`block px-3 py-2 rounded-lg text-sm font-medium ${isActive(link.path) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            onClick={() => setIsMenuOpen(false)}>
                            {link.name}
                        </Link>
                    ))}
                    <div className="border-t border-gray-100 pt-2 mt-2">
                        <Link to="/profile" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsMenuOpen(false)}>Profile</Link>
                        <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};
export default Navbar;
