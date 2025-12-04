import React, { useState } from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-900">
            {/* Sidebar */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Contenido Principal */}
            <main 
                className={`
                    flex-1 transition-all duration-300 ease-in-out
                    ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
                    pt-20 lg:pt-0
                `}
            >
                <div className="min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
