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
                    min-height: calc(100vh / 0.875);
                }
            `}</style>
            <div className="auth-layout-zoom min-h-screen">
                {children}
            </div>
        </>
    );
}
