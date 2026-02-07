import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FaceLogin = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('ready'); // ready, scanning, processing, success, error

    const statusMessages = {
        ready: {
            icon: '👤',
            title: 'Face Recognition Login',
            message: 'Click "Start Scan" to begin face recognition',
            color: 'text-blue-600',
        },
        scanning: {
            icon: '📸',
            title: 'Scanning...',
            message: 'Please look at the camera and stay still',
            color: 'text-yellow-600',
        },
        processing: {
            icon: '⚙️',
            title: 'Processing...',
            message: 'Analyzing face data',
            color: 'text-purple-600',
        },
        success: {
            icon: '✅',
            title: 'Success!',
            message: 'Face recognized successfully',
            color: 'text-green-600',
        },
        error: {
            icon: '❌',
            title: 'Recognition Failed',
            message: 'Face not recognized. Please try again.',
            color: 'text-red-600',
        },
    };

    const currentStatus = statusMessages[status];

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
                        <div className="text-8xl mb-4">{currentStatus.icon}</div>
                        <h2 className={`text-3xl font-bold mb-2 ${currentStatus.color}`}>
                            {currentStatus.title}
                        </h2>
                        <p className="text-gray-600 text-lg">
                            {currentStatus.message}
                        </p>
                    </div>

                    {/* Camera Status Area */}
                    <div className="bg-gray-100 rounded-xl p-8 mb-6 min-h-[200px] flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-gray-500 mb-2">
                                Camera and face detection handled by backend
                            </p>
                            <p className="text-sm text-gray-400">
                                Status updates will appear here
                            </p>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Ensure your face is well-lit</li>
                            <li>• Look directly at the camera</li>
                            <li>• Remove any face coverings</li>
                            <li>• Stay still during scanning</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setStatus('scanning')}
                            disabled={status === 'scanning' || status === 'processing'}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'ready' ? 'Start Scan' : 'Scanning...'}
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Info Note */}
                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        Backend will handle camera access and face recognition processing
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FaceLogin;
