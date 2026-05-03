import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
const MainLayout = () => {
    return (
        <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};
export default MainLayout;
