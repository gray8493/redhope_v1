import * as React from "react"
import { AlertCircle, ChevronLeft, ChevronRight, MapPin, Droplets, Calendar, ArrowRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay"

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

const SLIDES = [
    {
        id: 1,
        theme: "blue",
        badge: "CẦN MÁU KHẨN CẤP",
        badgeColor: "bg-red-500",
        title: "Trạng thái Nhóm máu O+",
        description: "Các bệnh viện tại TP.HCM đang thiếu hụt nhóm máu của bạn. Một lần hiến máu của bạn có thể cứu sống 3 người hôm nay.",
        buttonText: "Tìm điểm hiến máu gần nhất",
        icon: MapPin,
        imageElement: (
            <div className="w-24 h-32 bg-[#1a1f36] rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <div className="absolute top-0 right-0 p-1 opacity-50"><Droplets className="w-8 h-8 text-blue-500" /></div>
                <h2 className="text-4xl font-black text-white mb-1">O+</h2>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Nhóm của bạn</p>
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
            <div className="w-24 h-32 bg-gradient-to-b from-orange-900 to-[#1a1f36] rounded-xl border border-orange-500/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <div className="absolute top-1 left-1"><Calendar className="w-5 h-5 text-orange-500" /></div>
                <h2 className="text-2xl font-black text-orange-400 mb-1 leading-tight text-center px-2">XUÂN<br />HỒNG</h2>
                <p className="text-[9px] text-orange-200 mt-1 font-bold uppercase tracking-wider">20/01 - 20/02</p>
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
            <div className="w-24 h-32 bg-gradient-to-br from-[#6324eb] to-blue-600 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500 shadow-lg">
                <div className="text-white text-center">
                    <p className="text-sm font-bold opacity-80">Đã cứu</p>
                    <h2 className="text-3xl font-black text-white mb-1">500+</h2>
                    <p className="text-[10px] font-bold uppercase tracking-wider">Người</p>
                </div>
            </div>
        )
    }
];

export function DashboardCarousel() {
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    )

    return (
        <Carousel
            plugins={[plugin.current]}
            className="w-full h-44 rounded-2xl overflow-hidden shadow-xl group bg-[#0f1221]"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselContent>
                {SLIDES.map((slide) => (
                    <CarouselItem key={slide.id}>
                        <div className="w-full flex-shrink-0 h-44 relative p-5 md:p-6 flex items-center justify-between text-white">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-slate-800 rounded-full filter blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>

                            <div className="flex flex-col gap-2 max-w-lg z-10">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${slide.badgeColor} opacity-75`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${slide.badgeColor}`}></span>
                                    </span>
                                    <span className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">{slide.badge}</span>
                                </div>

                                <div>
                                    <h2 className="text-xl md:text-2xl font-black tracking-tight mb-1 leading-tight">{slide.title}</h2>
                                    <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed line-clamp-2">{slide.description}</p>
                                </div>

                                <button className="mt-1 w-fit bg-[#6324eb] hover:bg-[#501ac2] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#6324eb]/25 group-hover:translate-x-1">
                                    <slide.icon className="w-3 h-3" />
                                    {slide.buttonText}
                                </button>
                            </div>

                            <div className="hidden md:flex items-center justify-center mr-4 z-10">
                                {slide.imageElement}
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 border-none text-white" />
            <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 border-none text-white" />
        </Carousel>
    )
}
