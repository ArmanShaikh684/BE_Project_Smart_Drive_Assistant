import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PasswordLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        driverName: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
        if (apiError) {
            setApiError('');
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.driverName.trim()) {
            newErrors.driverName = 'Driver name is required';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous API error
        setApiError('');

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Set loading state
        setIsLoading(true);

        try {
            // Call backend API
            const response = await api.login(formData.driverName, formData.password);

            // Check if login was successful
            if (response.success) {
                // Success! Redirect to dashboard
                console.log('Login successful:', response.driver);
                navigate('/dashboard');
            } else {
                // Backend returned success: false
                setApiError(response.error || 'Login failed');
            }
        } catch (error) {
            // Handle different types of errors
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                setApiError('Unable to connect to server. Please check your connection and ensure the backend is running.');
            } else if (error.message.includes('401')) {
                setApiError('Invalid driver name or password');
            } else if (error.message.includes('500')) {
                setApiError('Server error. Please try again later.');
            } else {
                setApiError(error.message || 'An unexpected error occurred. Please try again.');
            }
            console.error('Login error:', error);
        } finally {
            // Clear loading state
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
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
                        <div className="text-6xl mb-4">🔐</div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            Password Login
                        </h2>
                        <p className="text-gray-600">
                            Sign in with your driver credentials
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Driver Name Field */}
                        <div>
                            <label htmlFor="driverName" className="block text-sm font-semibold text-gray-700 mb-2">
                                Driver Name
                            </label>
                            <input
                                type="text"
                                id="driverName"
                                name="driverName"
                                value={formData.driverName}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-gray-900 bg-white ${errors.driverName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your driver name"
                            />
                            {errors.driverName && (
                                <p className="mt-1 text-sm text-red-600">{errors.driverName}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-gray-900 bg-white ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your password"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* API Error Display */}
                        {apiError && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <div className="text-red-600 mr-3 text-xl">❌</div>
                                    <div>
                                        <p className="text-sm font-semibold text-red-800">Login Failed</p>
                                        <p className="text-sm text-red-700 mt-1">{apiError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </span>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-sm text-gray-500">or</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Alternative Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/auth/register')}
                            className="w-full py-2 text-green-600 hover:text-green-700 font-medium transition-colors"
                        >
                            Don't have an account? Register here
                        </button>
                        <button
                            onClick={() => navigate('/auth/face')}
                            className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            Try Face Recognition instead
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordLogin;
