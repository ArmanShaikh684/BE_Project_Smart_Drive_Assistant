import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const FaceLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [status, setStatus] = useState('initializing'); // initializing, scanning, success, failed, error
    const [message, setMessage] = useState('Initializing camera...');
    const [driverName, setDriverName] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const pollingIntervalRef = useRef(null);
    const timerIntervalRef = useRef(null);

    // Status configurations
    const statusConfig = {
        initializing: {
            icon: '⏳',
            title: 'Initializing',
            color: 'text-blue-600',
        },
        scanning: {
            icon: '📸',
            title: 'Scanning Face',
            color: 'text-yellow-600',
        },
        success: {
            icon: '✅',
            title: 'Face Recognized!',
            color: 'text-green-600',
        },
        failed: {
            icon: '❌',
            title: 'Recognition Failed',
            color: 'text-red-600',
        },
        error: {
            icon: '⚠️',
            title: 'Error',
            color: 'text-red-600',
        },
    };

    // Start face scan on component mount
    useEffect(() => {
        startScan();

        // Cleanup on unmount
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    const startScan = async () => {
        try {
            setStatus('initializing');
            setMessage('Starting face scan...');
            setElapsedTime(0);

            const response = await api.startFaceScan();

            if (response.success && response.session_id) {
                setSessionId(response.session_id);
                setMessage(response.message || 'Face scan started');

                // Start polling for status
                startPolling(response.session_id);

                // Start timer
                startTimer();
            } else {
                setStatus('error');
                setMessage('Failed to start face scan');
            }
        } catch (error) {
            console.error('Face scan error:', error);
            setStatus('error');
            setMessage(error.message || 'Unable to connect to server');
        }
    };

    const startPolling = (sid) => {
        // Poll every 500ms
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const response = await api.getFaceScanStatus(sid);

                if (response.success) {
                    const scanStatus = response.status;
                    setStatus(scanStatus);
                    setMessage(response.message || '');

                    if (scanStatus === 'success') {
                        // Face recognized!
                        if (response.driver) {
                            setDriverName(response.driver.name || 'Driver');
                            // Use auth context to set user
                            login(response.driver);
                        }

                        // Stop polling
                        clearInterval(pollingIntervalRef.current);
                        clearInterval(timerIntervalRef.current);

                        // Redirect to dashboard after 2 seconds
                        setTimeout(() => {
                            navigate('/dashboard');
                        }, 2000);

                    } else if (scanStatus === 'failed' || scanStatus === 'error') {
                        // Stop polling on failure
                        clearInterval(pollingIntervalRef.current);
                        clearInterval(timerIntervalRef.current);
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
                setStatus('error');
                setMessage('Lost connection to server');
                clearInterval(pollingIntervalRef.current);
                clearInterval(timerIntervalRef.current);
            }
        }, 500);
    };

    const startTimer = () => {
        timerIntervalRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    };

    const handleRetry = () => {
        // Clear existing intervals
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }

        // Restart scan
        startScan();
    };

    const currentStatusConfig = statusConfig[status] || statusConfig.initializing;

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
                    {/* Status Display */}
                    <div className="text-center mb-8">
                        <div className="text-8xl mb-4 animate-pulse">{currentStatusConfig.icon}</div>
                        <h2 className={`text-3xl font-bold mb-2 ${currentStatusConfig.color}`}>
                            {currentStatusConfig.title}
                        </h2>
                        <p className="text-gray-600 text-lg">
                            {message}
                        </p>
                        {status === 'success' && driverName && (
                            <p className="text-green-600 font-semibold mt-2">
                                Welcome, {driverName}!
                            </p>
                        )}
                    </div>

                    {/* Timer Display (only during scanning) */}
                    {(status === 'scanning' || status === 'initializing') && (
                        <div className="text-center mb-6">
                            <div className="inline-block bg-gray-100 rounded-lg px-6 py-3">
                                <p className="text-gray-700 font-mono text-xl">
                                    {elapsedTime}s / 8s
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Camera Status Area */}
                    <div className="bg-gray-100 rounded-xl p-8 mb-6 min-h-[200px] flex items-center justify-center">
                        <div className="text-center">
                            {status === 'scanning' && (
                                <>
                                    <div className="mb-4">
                                        <div className="w-32 h-32 mx-auto border-4 border-blue-500 rounded-full animate-ping opacity-75"></div>
                                    </div>
                                    <p className="text-gray-700 font-semibold mb-2">
                                        Look at the camera
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Keep your face visible and stay still
                                    </p>
                                </>
                            )}
                            {status === 'initializing' && (
                                <p className="text-gray-500">
                                    Preparing camera...
                                </p>
                            )}
                            {status === 'success' && (
                                <p className="text-green-600 font-semibold">
                                    Redirecting to dashboard...
                                </p>
                            )}
                            {(status === 'failed' || status === 'error') && (
                                <p className="text-gray-500">
                                    Scan complete
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    {(status === 'initializing' || status === 'scanning') && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Ensure your face is well-lit</li>
                                <li>• Look directly at the camera</li>
                                <li>• Remove any face coverings</li>
                                <li>• Stay still during scanning</li>
                            </ul>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        {(status === 'failed' || status === 'error') && (
                            <>
                                <button
                                    onClick={handleRetry}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => navigate('/auth/password')}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
                                >
                                    Use Password
                                </button>
                            </>
                        )}
                        {(status === 'initializing' || status === 'scanning') && (
                            <button
                                onClick={() => navigate('/')}
                                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    {/* Alternative Options (on failure) */}
                    {(status === 'failed' || status === 'error') && (
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-500 mb-2">Or try another method:</p>
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => navigate('/auth/guest')}
                                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                                >
                                    Continue as Guest
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Note */}
                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        Backend handles camera access and face recognition processing
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FaceLogin;
