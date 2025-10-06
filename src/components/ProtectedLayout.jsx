import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { routeConfig } from '../App';
import Sidebar from './Sidebar';
import Header from './Header';

const ProtectedLayout = () => {
    const location = useLocation();
    const config = routeConfig[location.pathname] || {};

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header title={config.title} subtitle={config.subtitle} />
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ProtectedLayout;
