import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthHome = () => {
    const navigate = useNavigate();

    const authOptions = [
        {
            id: 'face',
            title: 'Scan Face',
            description: 'Quick and secure face recognition login',
            icon: '👤',
            route: '/auth/face',
            color: 'from-blue-500 to-blue-600',
        },
        {
            id: 'password',
            title: 'Login with Password',
            description: 'Sign in using your driver name and password',
            icon: '🔐',
            route: '/auth/password',
            color: 'from-green-500 to-green-600',
        },
        {
            id: 'register',
            title: 'Register New Driver',
            description: 'Create a new driver account',
            icon: '📝',
            route: '/auth/register',
            color: 'from-purple-500 to-purple-600',
        },
        {
            id: 'guest',
            title: 'Continue as Guest',
            description: 'Quick access with limited features',
            icon: '🚶',
            route: '/auth/guest',
            color: 'from-gray-500 to-gray-600',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Smart Driver Assistant
                    </h1>
                    <p className="text-xl text-gray-300">
                        Choose your authentication method
                    </p>
                </div>

                {/* Auth Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {authOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => navigate(option.route)}
                            className="group relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                            {/* Content */}
                            <div className="relative p-8 flex items-center space-x-6">
                                {/* Icon */}
                                <div className={`flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center text-4xl shadow-lg`}>
                                    {option.icon}
                                </div>

                                {/* Text */}
                                <div className="flex-1 text-left">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        {option.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {option.description}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center mt-12">
                    <p className="text-gray-400 text-sm">
                        Secure authentication powered by advanced AI technology
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthHome;
