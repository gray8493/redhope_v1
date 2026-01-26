import React from 'react';

interface MiniFooterProps {
    className?: string;
}

const MiniFooter = ({ className = "" }: MiniFooterProps) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`mt-auto border-t border-red-100 dark:border-red-900/30 bg-white dark:bg-[#1c162e] py-8 px-10 text-center ${className}`}>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
                © {currentYear} REDHOPE - Nền tảng Hiến máu Thông minh. Bảo vệ quyền riêng tư người hiến và sức khỏe cộng đồng.
            </p>
        </footer>
    );
};

export default MiniFooter;
