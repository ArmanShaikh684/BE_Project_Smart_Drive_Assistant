import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const DriverProfile = () => {
    const { user, faceRegistered, updateFaceRegistration } = useAuth();
    const [registrationStatus, setRegistrationStatus] = useState('checking'); // checking, registered, not_registered
    const [isRegistering, setIsRegistering] = useState(false);
    const [regStatus, setRegStatus] = useState('idle'); // idle, capturing, processing, success, error
    const [regMessage, setRegMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const pollingIntervalRef = useRef(null);

    // Check face registration status on mount
    useEffect(() => {
        checkRegistrationStatus();

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const checkRegistrationStatus = async () => {
        if (!user || !user.driver_id) {
            setRegistrationStatus('not_registered');
            return;
        }

        try {
            const response = await api.checkFaceRegistration(user.driver_id);
            if (response.success && response.registered) {
                setRegistrationStatus('registered');
                updateFaceRegistration(true);
            } else {
                setRegistrationStatus('not_registered');
                updateFaceRegistration(false);
            }
        } catch (error) {
            console.error('Error checking face registration:', error);
            setRegistrationStatus('not_registered');
        }
    };

    const handleRegisterFace = async () => {
        if (!user || !user.driver_id) {
            alert('User information not available');
            return;
        }

        try {
            setIsRegistering(true);
            setRegStatus('idle');
            setRegMessage('Starting face registration...');

            const response = await api.startFaceRegistration(user.driver_id);

            if (response.success && response.session_id) {
                setSessionId(response.session_id);
                setRegMessage(response.message || 'Face registration started');
                startPolling(response.session_id);
            } else {
                setRegStatus('error');
                setRegMessage('Failed to start face registration');
                setIsRegistering(false);
            }
        } catch (error) {
            console.error('Face registration error:', error);
            setRegStatus('error');
            setRegMessage(error.message || 'Unable to connect to server');
            setIsRegistering(false);
        }
    };

    const startPolling = (sid) => {
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const response = await api.getFaceRegistrationStatus(sid);

                if (response.success) {
                    const status = response.status;
                    setRegStatus(status);
                    setRegMessage(response.message || '');

                    if (status === 'success') {
                        clearInterval(pollingIntervalRef.current);
                        setIsRegistering(false);
                        setRegistrationStatus('registered');
                        updateFaceRegistration(true);

                        // Close modal after 2 seconds
                        setTimeout(() => {
                            setRegStatus('idle');
                        }, 2000);

                    } else if (status === 'failed' || status === 'error') {
                        clearInterval(pollingIntervalRef.current);
                        setIsRegistering(false);
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
                setRegStatus('error');
                setRegMessage('Lost connection to server');
                clearInterval(pollingIntervalRef.current);
                setIsRegistering(false);
            }
        }, 500);
    };

    const closeModal = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
        setIsRegistering(false);
        setRegStatus('idle');
    };

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-gray-600">Loading user profile...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Driver Profile</h1>

            {/* User Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="text-lg font-medium text-gray-800">{user.name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Driver Type</p>
                        <p className="text-lg font-medium text-gray-800">{user.driver_type || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Emergency Contact</p>
                        <p className="text-lg font-medium text-gray-800">{user.emergency_contact_name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-lg font-medium text-gray-800">{user.email_receiver || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Face Authentication Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Face Authentication</h2>

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-gray-600 mb-2">Face Recognition Status</p>
                        {registrationStatus === 'checking' && (
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                Checking...
                            </span>
                        )}
                        {registrationStatus === 'registered' && (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                ✓ Registered
                            </span>
                        )}
                        {registrationStatus === 'not_registered' && (
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                Not Registered
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleRegisterFace}
                        disabled={isRegistering}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${isRegistering
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                            }`}
                    >
                        {registrationStatus === 'registered' ? 'Update Face' : 'Register Face'}
                    </button>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        {registrationStatus === 'registered'
                            ? 'Face login is enabled. You can now use face recognition to log in quickly.'
                            : 'Register your face to enable quick and secure face recognition login.'}
                    </p>
                </div>
            </div>

            {/* Face Registration Modal */}
            {isRegistering && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                        <div className="text-center">
                            {/* Status Icon */}
                            <div className="text-6xl mb-4">
                                {regStatus === 'idle' && '⏳'}
                                {regStatus === 'capturing' && '📸'}
                                {regStatus === 'processing' && '⚙️'}
                                {regStatus === 'success' && '✅'}
                                {(regStatus === 'failed' || regStatus === 'error') && '❌'}
                            </div>

                            {/* Status Title */}
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                {regStatus === 'idle' && 'Initializing'}
                                {regStatus === 'capturing' && 'Capturing Face'}
                                {regStatus === 'processing' && 'Processing'}
                                {regStatus === 'success' && 'Success!'}
                                {regStatus === 'failed' && 'Failed'}
                                {regStatus === 'error' && 'Error'}
                            </h3>

                            {/* Status Message */}
                            <p className="text-gray-600 mb-6">{regMessage}</p>

                            {/* Instructions (during capture) */}
                            {regStatus === 'capturing' && (
                                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-blue-800 font-semibold mb-2">Instructions:</p>
                                    <ul className="text-sm text-blue-700 text-left space-y-1">
                                        <li>• Look directly at the camera</li>
                                        <li>• Ensure good lighting</li>
                                        <li>• Remove face coverings</li>
                                        <li>• Stay still</li>
                                    </ul>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {regStatus === 'success' && (
                                <button
                                    onClick={closeModal}
                                    className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-all"
                                >
                                    Done
                                </button>
                            )}
                            {(regStatus === 'failed' || regStatus === 'error') && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleRegisterFace}
                                        className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                            {(regStatus === 'idle' || regStatus === 'capturing' || regStatus === 'processing') && (
                                <button
                                    onClick={closeModal}
                                    className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverProfile;
