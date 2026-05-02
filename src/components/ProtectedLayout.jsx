import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { routeConfig } from '../App';
import Sidebar from './Sidebar';
import Header from './Header';

const ProtectedLayout = () => {
    const location = useLocation();
    const config = routeConfig[location.pathname] || {};

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <div className="ml-72 flex min-h-screen flex-col">
                <Header title={config.title} subtitle={config.subtitle} />
                <main className="flex-1 p-6 md:p-8">
                    <div className="mx-auto w-full max-w-[1400px]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProtectedLayout;
