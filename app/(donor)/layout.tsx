import React from 'react';

export default function DonorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <style>{`
                .donor-layout-zoom {
                    zoom: 0.875;
                    height: calc(100vh / 0.875);
                }
            `}</style>
            <div className="donor-layout-zoom h-screen pb-[68px] md:pb-0">
                {children}
            </div>
        </>
    );
}
