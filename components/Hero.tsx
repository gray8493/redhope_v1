import React from 'react';
import { PlayIcon, HeartPulse } from './icons';

const Hero = () => {
    return (
        <section className="relative bg-bg-light overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
            {/* Background blobs/gradients */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-3xl opacity-60"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    {/* Text Content */}
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-bold tracking-wide uppercase mb-6">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Mạng lưới hoạt động thời gian thực
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-6">
                            Công nghệ thông minh cho <br className="hidden md:block" />
                            <span className="text-accent-red">Món quà Sự sống</span>
                        </h1>

                        <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                            Kết nối người hiến máu và bệnh viện trong thời gian thực. Tham gia mạng lưới hiến máu thông minh nhất thế giới và cứu sống nhiều người hơn.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5">
                                Hiến máu ngay
                            </button>
                            <button className="flex items-center justify-center gap-3 bg-white text-gray-700 px-8 py-4 rounded-xl font-bold text-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
                                <PlayIcon className="w-5 h-5 fill-current" />
                                <span>Video giới thiệu</span>
                            </button>
                        </div>
                    </div>

                    {/* Hero Image Area */}
                    <div className="relative mt-12 lg:mt-0">
                        {/* Main Image Container */}
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50">
                            {/* Mock Image - In production use next/image */}
                            <div className="bg-slate-200 aspect-[4/3] w-full object-cover relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent"></div>
                                {/* Decorative placeholder content since we don't have the image file */}
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                    <img
                                        src="/homepage.jpg"
                                        alt="Đội ngũ y tế"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Decorative Background Elements behind image */}
                        <div className="absolute -z-10 top-1/2 right-1/2 translate-x-1/2 translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-50 blur-2xl"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
