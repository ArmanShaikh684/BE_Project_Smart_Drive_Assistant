import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/alerts', label: 'Alerts', icon: '🚨' },
        { path: '/driver-profile', label: 'Driver Profile', icon: '👤' },
        { path: '/settings', label: 'Settings', icon: '⚙️' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="w-64 bg-gray-800 text-white min-h-screen p-4">
            <div className="mb-8">
                <h2 className="text-xl font-bold">Smart Driver Assistant</h2>
            </div>
            <nav>
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive(item.path)
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
