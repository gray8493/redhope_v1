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
                    zoom: 0.8;
                    height: calc(100vh / 0.8);
                }
            `}</style>
            <div className="donor-layout-zoom overflow-hidden pb-[68px] md:pb-0 bg-[#f6f6f8] dark:bg-[#161121]">
                {children}
            </div>
        </>
    );
}
