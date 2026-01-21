import React from 'react';
import { RedHopeLogo } from './icons';

const Navbar = () => {
    return (
        <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                        <RedHopeLogo className="w-16 h-16" />
                        <span className="font-display font-extrabold text-2xl tracking-tight text-red-900">REDHOPE</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#" className="text-gray-600 hover:text-primary font-medium transition-colors">Cách thức hoạt động</a>
                        <a href="#" className="text-gray-600 hover:text-primary font-medium transition-colors">Tác động</a>
                        <a href="#" className="text-gray-600 hover:text-primary font-medium transition-colors">Chia sẻ</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <a href="/login" className="hidden md:block text-gray-900 font-medium px-4 py-2 hover:bg-gray-50 rounded-full transition-colors">
                            Đăng nhập
                        </a>
                        <a href="/register" className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40">
                            Đăng ký
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
