import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const GuestAccess = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const limitations = [
        'Limited access to real-time alerts',
        'Cannot save driver preferences',
        'No personalized dashboard',
        'Limited historical data access',
        'No profile customization',
    ];

    const handleContinue = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await api.guestLogin();
            if (response.success) {
                console.log('Guest login successful:', response.driver);
                // Navigate to dashboard as guest
                navigate('/dashboard');
            } else {
                setError(response.error || 'Failed to enter guest mode');
            }
        } catch (err) {
            console.error('Guest login error:', err);
            setError('Unable to connect to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center text-gray-300 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Authentication
                </button>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">🚶</div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            Continue as Guest
                        </h2>
                        <p className="text-gray-600">
                            Quick access with limited features
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Welcome Message */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                            Welcome, Guest!
                        </h3>
                        <p className="text-gray-700">
                            You can explore the Smart Driver Assistant with guest access.
                            However, some features will be limited to ensure the best experience
                            for registered drivers.
                        </p>
                    </div>

                    {/* Limitations Notice */}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start mb-3">
                            <div className="text-2xl mr-3">⚠️</div>
                            <div>
                                <h4 className="font-semibold text-yellow-900 mb-2">
                                    Guest Mode Limitations
                                </h4>
                                <ul className="space-y-2">
                                    {limitations.map((limitation, index) => (
                                        <li key={index} className="text-sm text-yellow-800 flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>{limitation}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Benefits of Registration */}
                    <div className="bg-blue-50 rounded-xl p-6 mb-6">
                        <h4 className="font-semibold text-blue-900 mb-3">
                            💡 Get Full Access by Registering
                        </h4>
                        <p className="text-sm text-blue-800 mb-3">
                            Create a free account to unlock all features including:
                        </p>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Personalized driver profile</li>
                            <li>• Full alert history and analytics</li>
                            <li>• Custom safety preferences</li>
                            <li>• Face recognition login</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleContinue}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Entering Guest Mode...
                                </>
                            ) : (
                                "Continue as Guest"
                            )}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">or</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/auth/register')}
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            Create an Account
                        </button>

                        <button
                            onClick={() => navigate('/auth/password')}
                            className="w-full py-2 text-green-600 hover:text-green-700 font-medium transition-colors"
                        >
                            Already have an account? Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestAccess;
