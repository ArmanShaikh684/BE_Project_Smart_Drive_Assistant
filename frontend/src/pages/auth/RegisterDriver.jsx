import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const RegisterDriver = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email_receiver: '',
        phone: '', // Optional
        emergency_contact_name: '',
        emergency_contact_number: '',
        trusted_contacts: {}, // format: { "Name": "Number" }
        password: '',
        confirmPassword: ''
    });

    // Verification state for Step 2 (Trusted Contacts)
    const [newContactName, setNewContactName] = useState('');
    const [newContactNumber, setNewContactNumber] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleAddContact = () => {
        if (!newContactName || !newContactNumber) {
            setError('Both name and number are required for trusted contacts');
            return;
        }
        setFormData(prev => ({
            ...prev,
            trusted_contacts: {
                ...prev.trusted_contacts,
                [newContactName]: newContactNumber
            }
        }));
        setNewContactName('');
        setNewContactNumber('');
        setError('');
    };

    const handleRemoveContact = (name) => {
        const updatedContacts = { ...formData.trusted_contacts };
        delete updatedContacts[name];
        setFormData(prev => ({ ...prev, trusted_contacts: updatedContacts }));
    };

    const validateStep = () => {
        setError('');

        if (step === 1) {
            if (!formData.name.trim()) return 'Driver Name is required';
            if (!formData.email_receiver.trim()) return 'Email is required';
            if (!formData.email_receiver.includes('@')) return 'Invalid email format';
        }

        if (step === 2) {
            if (!formData.emergency_contact_name.trim()) return 'Emergency Contact Name is required';
            if (!formData.emergency_contact_number.trim()) return 'Emergency Contact Number is required';
        }

        if (step === 3) {
            if (!formData.password) return 'Password is required';
            if (formData.password.length < 4) return 'Password must be at least 4 characters';
            if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
        }

        return null;
    };

    const handleNext = () => {
        const validationError = validateStep();
        if (validationError) {
            setError(validationError);
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        setError('');
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            // Remove confirmPassword and phone before sending if not needed by backend
            const submissionData = { ...formData };
            delete submissionData.confirmPassword;

            console.log("Submitting:", submissionData);

            const response = await api.register(submissionData);

            if (response.success) {
                // Redirect to password login on success
                navigate('/auth/password');
            } else {
                setError(response.error || 'Registration failed');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center text-gray-300 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Authentication
                </button>

                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Progress Bar */}
                    <div className="bg-gray-100 h-2">
                        <div
                            className="bg-purple-600 h-full transition-all duration-300"
                            style={{ width: `${(step / 4) * 100}%` }}
                        ></div>
                    </div>

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Driver Registration</h2>
                            <p className="text-gray-600 mt-2">Step {step} of 4</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Basic Information</h3>
                                <div>
                                    <label className="block text-gray-700 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 bg-white"
                                        placeholder="John Doe"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email_receiver"
                                        value={formData.email_receiver}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 bg-white"
                                        placeholder="john@example.com"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Used for emergency alerts</p>
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Phone Number (Optional)</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 bg-white"
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Emergency & Trusted Contacts */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Emergency Contact (Required)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-700 mb-2">Contact Name *</label>
                                            <input
                                                type="text"
                                                name="emergency_contact_name"
                                                value={formData.emergency_contact_name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 mb-2">Contact Number *</label>
                                            <input
                                                type="tel"
                                                name="emergency_contact_number"
                                                value={formData.emergency_contact_number}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Trusted Contacts (Optional)</h3>
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            value={newContactName}
                                            onChange={(e) => setNewContactName(e.target.value)}
                                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 bg-white"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Number"
                                            value={newContactNumber}
                                            onChange={(e) => setNewContactNumber(e.target.value)}
                                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 bg-white"
                                        />
                                        <button
                                            onClick={handleAddContact}
                                            type="button"
                                            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* List of Trusted Contacts */}
                                    <div className="space-y-2">
                                        {Object.entries(formData.trusted_contacts).map(([name, number]) => (
                                            <div key={name} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                                <span className="font-medium text-gray-700">{name} ({number})</span>
                                                <button
                                                    onClick={() => handleRemoveContact(name)}
                                                    type="button"
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        {Object.keys(formData.trusted_contacts).length === 0 && (
                                            <p className="text-gray-500 text-sm italic">No trusted contacts added yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Security */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Security</h3>
                                <div>
                                    <label className="block text-gray-700 mb-2">Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 bg-white"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Minimum 4 characters</p>
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Confirm Password *</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 bg-white"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review & Submit */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4">Review Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-500">Full Name</p>
                                        <p className="font-semibold text-gray-800">{formData.name}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-semibold text-gray-800">{formData.email_receiver}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-500">Emergency Contact</p>
                                        <p className="font-semibold text-gray-800">{formData.emergency_contact_name}</p>
                                        <p className="text-gray-600">{formData.emergency_contact_number}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-500">Trusted Contacts</p>
                                        <p className="font-semibold text-gray-800">{Object.keys(formData.trusted_contacts).length} Added</p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <p className="text-blue-800 text-sm">
                                        <strong>Note:</strong> Face registration is handled separately. After registering, you can set up face login from your profile settings.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-8 flex justify-between">
                            {step > 1 && (
                                <button
                                    onClick={handleBack}
                                    type="button"
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                            )}

                            {step < 4 ? (
                                <button
                                    onClick={handleNext}
                                    type="button"
                                    className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Next Step
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    type="button"
                                    disabled={loading}
                                    className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Account...
                                        </>
                                    ) : (
                                        "Complete Registration"
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterDriver;
