import React from 'react';

const Navbar = () => {
    return (
        <div className="bg-white shadow-md p-4 flex justify-between items-center">
            <div>
                <h1 className="text-xl font-semibold text-gray-800">Welcome</h1>
            </div>
            <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-gray-800">
                    🔔 Notifications
                </button>
                <button className="text-gray-600 hover:text-gray-800">
                    👤 Profile
                </button>
            </div>
        </div>
    );
};

export default Navbar;
