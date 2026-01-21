"use client";

import { useState, useEffect } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, MapPin, Droplets, Calendar, ArrowRight } from "lucide-react";

const SLIDES = [
    {
        id: 1,
        theme: "blue",
        badge: "CẦN MÁU KHẨN CẤP",
        badgeColor: "bg-red-500",
        title: "Trạng thái Nhóm máu O+",
        description: "Các bệnh viện tại TP.HCM đang thiếu hụt hụt nhóm máu của bạn. Một lần hiến máu của bạn có thể cứu sống 3 người hôm nay.",
        buttonText: "Tìm điểm hiến máu gần nhất",
        icon: MapPin,
        imageElement: (
            <div className="w-32 h-44 bg-[#1a1f36] rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <div className="absolute top-0 right-0 p-2 opacity-50"><Droplets className="w-12 h-12 text-blue-500" /></div>
                <h2 className="text-5xl font-black text-white mb-1">O+</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nhóm của bạn</p>
                <div className="absolute bottom-0 w-full h-1 bg-red-500"></div>
            </div>
        )
    },
    {
        id: 2,
        theme: "orange",
        badge: "CHIẾN DỊCH ĐẶC BIỆT",
        badgeColor: "bg-orange-500",
        title: "Lễ hội Xuân Hồng 2024",
        description: "Tham gia hiến máu đầu năm - Nhân đôi phúc lộc. Nhận ngay quà tặng đặc biệt và huy hiệu giới hạn.",
        buttonText: "Đăng ký tham gia ngay",
        icon: Calendar,
        imageElement: (
            <div className="w-32 h-44 bg-gradient-to-b from-orange-900 to-[#1a1f36] rounded-xl border border-orange-500/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <div className="absolute top-2 left-2"><Calendar className="w-6 h-6 text-orange-500" /></div>
                <h2 className="text-4xl font-black text-orange-400 mb-1 leading-tight text-center px-2">XUÂN<br />HỒNG</h2>
                <p className="text-[10px] text-orange-200 mt-2 font-bold uppercase tracking-wider">20/01 - 20/02</p>
            </div>
        )
    },
    {
        id: 3,
        theme: "purple",
        badge: "TIN TỨC CỘNG ĐỒNG",
        badgeColor: "bg-purple-500",
        title: "Kỷ lục hiến máu mới",
        description: "Tháng vừa qua, cộng đồng BloodLink đã cứu giúp hơn 500 bệnh nhân. Xem báo cáo tác động chi tiết.",
        buttonText: "Xem báo cáo tác động",
        icon: ArrowRight,
        imageElement: (
            <div className="w-32 h-44 bg-gradient-to-br from-[#6324eb] to-blue-600 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-lg">
                <div className="text-white text-center">
                    <p className="text-lg font-bold opacity-80">Đã cứu</p>
                    <h2 className="text-5xl font-black text-white mb-1">500+</h2>
                    <p className="text-xs font-bold uppercase tracking-wider">Người</p>
                </div>
            </div>
        )
    }
];

export function DashboardHeader() {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance logic
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000); // 5 seconds
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

    return (
        <div className="flex flex-col gap-6 mb-8">
            {/* Header Top Row */}
            <div className="flex flex-wrap justify-between items-end">
                <div className="flex flex-col gap-1">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Chào Alex!</h1>
                    <p className="text-slate-500 text-sm font-medium">Hôm nay là một ngày tuyệt vời để chia sẻ sự sống.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-lg">
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Trạng thái</p>
                        <div className="flex items-center gap-2">
                            <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Đủ điều kiện hiến máu</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* News Carousel */}
            <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-xl group">
                <div
                    className="absolute inset-0 flex transition-transform duration-500 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {SLIDES.map((slide) => (
                        <div key={slide.id} className="w-full flex-shrink-0 h-full relative p-8 md:p-10 flex items-center justify-between bg-[#0f1221] text-white">
                            {/* Background Effects */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full filter blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>

                            <div className="flex flex-col gap-4 max-w-lg z-10">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${slide.badgeColor} opacity-75`}></span>
                                        <span className={`relative inline-flex rounded-full h-3 w-3 ${slide.badgeColor}`}></span>
                                    </span>
                                    <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">{slide.badge}</span>
                                </div>

                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2 leading-tight">{slide.title}</h2>
                                    <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">{slide.description}</p>
                                </div>

                                <button className="mt-2 w-fit bg-[#6324eb] hover:bg-[#501ac2] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#6324eb]/25 group-hover:translate-x-1">
                                    <slide.icon className="w-4 h-4" />
                                    {slide.buttonText}
                                </button>
                            </div>

                            {/* Right Side Visual */}
                            <div className="hidden md:flex items-center justify-center mr-8 z-10">
                                {slide.imageElement}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons (Hover only) */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {SLIDES.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all ${currentSlide === index ? "w-8 bg-[#6324eb]" : "w-2 bg-white/20 hover:bg-white/40"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
