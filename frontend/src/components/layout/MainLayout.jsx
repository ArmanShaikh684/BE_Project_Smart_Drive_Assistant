import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
    return (
        <div
            className="flex min-h-screen"
            style={{ background: 'linear-gradient(135deg, #00040d 0%, #000816 50%, #00040d 100%)' }}
        >
            {/* Icon sidebar */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
