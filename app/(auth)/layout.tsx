import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <style>{`
                .auth-layout-zoom {
                    zoom: 0.875;
                    height: calc(100vh / 0.875);
                    overflow-y: auto;
                }
            `}</style>
            <div className="auth-layout-zoom">
                {children}
            </div>
        </>
    );
}
