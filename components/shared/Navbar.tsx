"use client";

import { RedHopeLogo, NameRedHope } from './icons';
import { Menu } from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
    return (
        <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                        <RedHopeLogo />
                        <NameRedHope />
                    </div>



                    <div className="flex items-center gap-2">
                        <Link href="/login" className="hidden sm:block text-gray-900 font-medium px-4 py-2 hover:bg-gray-50 rounded-full transition-colors text-sm md:text-base">
                            Đăng nhập
                        </Link>
                        <Link href="/register" className="bg-primary text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 text-sm md:text-base">
                            Đăng ký
                        </Link>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-mobile-menu'))}
                            className="p-2 rounded-lg bg-gray-100 text-gray-600 md:hidden ml-1"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
