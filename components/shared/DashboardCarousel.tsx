"use client";
import * as React from "react"
import { Gift, ChevronRight, Tag, Ticket, Sparkles, Star, Loader2 } from "lucide-react";
import Autoplay from "embla-carousel-autoplay"

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { voucherService } from "@/services/voucher.service";
import Link from "next/link";

interface SlideData {
    id: string | number;
    theme: string;
    badge: string;
    badgeColor: string;
    title: string;
    description: string;
    pointCost: number;
    buttonText: string;
    buttonLink: string;
    icon: any;
    imageElement: React.ReactNode;
}

// Màu sắc xoay vòng cho các voucher
const VOUCHER_THEMES = [
    { bg: "from-violet-600/20 via-purple-500/10", accent: "text-violet-400", badgeBg: "bg-violet-500", iconBg: "from-violet-800 to-violet-950", borderColor: "border-violet-500/30" },
    { bg: "from-emerald-600/20 via-teal-500/10", accent: "text-emerald-400", badgeBg: "bg-emerald-500", iconBg: "from-emerald-800 to-emerald-950", borderColor: "border-emerald-500/30" },
    { bg: "from-amber-600/20 via-orange-500/10", accent: "text-amber-400", badgeBg: "bg-amber-500", iconBg: "from-amber-800 to-amber-950", borderColor: "border-amber-500/30" },
    { bg: "from-sky-600/20 via-blue-500/10", accent: "text-sky-400", badgeBg: "bg-sky-500", iconBg: "from-sky-800 to-sky-950", borderColor: "border-sky-500/30" },
    { bg: "from-rose-600/20 via-pink-500/10", accent: "text-rose-400", badgeBg: "bg-rose-500", iconBg: "from-rose-800 to-rose-950", borderColor: "border-rose-500/30" },
];

const VOUCHER_ICONS = [Gift, Tag, Ticket, Sparkles, Star];

const DEFAULT_SLIDES: SlideData[] = [
    {
        id: 'default-voucher',
        theme: "purple",
        badge: "ĐỔI ĐIỂM NGAY",
        badgeColor: "bg-[#6324eb]",
        title: "Khám phá ưu đãi hấp dẫn",
        description: "Đổi điểm hiến máu lấy voucher từ các đối tác hàng đầu. Mỗi giọt máu bạn hiến đều có giá trị!",
        pointCost: 0,
        buttonText: "Xem tất cả ưu đãi",
        buttonLink: "/rewards",
        icon: Gift,
        imageElement: (
            <div className="w-24 h-32 bg-gradient-to-b from-[#6324eb]/40 to-[#1a1f36] rounded-xl border border-[#6324eb]/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <div className="absolute top-0 right-0 p-1 opacity-40"><Sparkles className="w-8 h-8 text-purple-400" /></div>
                <Gift className="w-10 h-10 text-purple-400 mb-1" />
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Voucher</p>
                <div className="absolute bottom-0 w-full h-1 bg-[#6324eb]"></div>
            </div>
        )
    }
];

export function DashboardCarousel() {
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    const [slides, setSlides] = React.useState<SlideData[]>(DEFAULT_SLIDES);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const vouchers = await voucherService.getAll();
                // Chỉ lấy voucher Active
                const activeVouchers = vouchers.filter((v: any) => v.status === 'Active');

                if (activeVouchers && activeVouchers.length > 0) {
                    const voucherSlides: SlideData[] = activeVouchers.map((voucher: any, index: number) => {
                        const theme = VOUCHER_THEMES[index % VOUCHER_THEMES.length];
                        const IconComponent = VOUCHER_ICONS[index % VOUCHER_ICONS.length];

                        return {
                            id: voucher.id,
                            theme: "voucher",
                            badge: voucher.point_cost ? `${voucher.point_cost.toLocaleString()} ĐIỂM` : "MIỄN PHÍ",
                            badgeColor: theme.badgeBg,
                            title: voucher.title || voucher.partner_name || "Ưu đãi",
                            description: voucher.description
                                || `Voucher giảm giá từ ${voucher.partner_name || "đối tác"}. Đổi ngay trước khi hết hạn!`,
                            pointCost: voucher.point_cost || 0,
                            buttonText: "Đổi voucher",
                            buttonLink: "/rewards",
                            icon: IconComponent,
                            imageElement: (
                                <div className={`w-24 h-32 bg-gradient-to-b ${theme.iconBg} rounded-xl border ${theme.borderColor} flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500`}>
                                    <div className="absolute top-1 right-1 opacity-30"><Star className="w-5 h-5 text-white" /></div>
                                    <IconComponent className={`w-9 h-9 ${theme.accent} mb-1`} />
                                    <p className="text-[10px] text-white/70 font-bold text-center px-1 leading-tight line-clamp-2">
                                        {voucher.partner_name || "Ưu đãi"}
                                    </p>
                                    {voucher.point_cost && (
                                        <div className={`absolute bottom-0 w-full py-0.5 ${theme.badgeBg}/80 text-center`}>
                                            <span className="text-[8px] font-black text-white">{voucher.point_cost} pts</span>
                                        </div>
                                    )}
                                </div>
                            )
                        };
                    });
                    setSlides([...voucherSlides, ...DEFAULT_SLIDES]);
                } else {
                    setSlides(DEFAULT_SLIDES);
                }
            } catch (error: any) {
                console.error("Failed to fetch vouchers for carousel", error.message || error.details || error);
            } finally {
                setLoading(false);
            }
        };

        fetchVouchers();
    }, []);

    return (
        <Carousel
            plugins={[plugin.current]}
            className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl group bg-[#0f1221] relative"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselContent>
                {slides.map((slide) => (
                    <CarouselItem key={slide.id}>
                        <div className="w-full flex-shrink-0 h-[200px] sm:h-[250px] md:h-[300px] relative p-4 sm:p-6 md:p-10 flex items-center justify-between text-white">
                            {/* Background Effect */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-slate-800 rounded-full filter blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-900/30 rounded-full filter blur-[80px] opacity-30 -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

                            <div className="flex flex-col gap-2 max-w-lg z-10">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${slide.badgeColor} opacity-75`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${slide.badgeColor}`}></span>
                                    </span>
                                    <span className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">{slide.badge}</span>
                                </div>

                                <div>
                                    <h2 className="text-base sm:text-xl md:text-2xl font-black tracking-tight mb-1 leading-tight line-clamp-1">{slide.title}</h2>
                                    <p className="text-slate-300 text-[11px] sm:text-xs md:text-sm font-medium leading-relaxed line-clamp-2">{slide.description}</p>
                                </div>

                                <Link href={slide.buttonLink}>
                                    <button className="mt-1 w-fit bg-[#6324eb] hover:bg-[#501ac2] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-[11px] sm:text-xs flex items-center gap-1.5 sm:gap-2 transition-all shadow-lg shadow-[#6324eb]/25 group-hover:translate-x-1">
                                        <slide.icon className="w-3 h-3" />
                                        {slide.buttonText}
                                        <ChevronRight className="w-3 h-3 opacity-60" />
                                    </button>
                                </Link>
                            </div>

                            <div className="hidden md:flex items-center justify-center mr-4 z-10">
                                {slide.imageElement}
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>

            {/* Navigation Controls */}
            <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 border-none text-white absolute top-1/2 -translate-y-1/2 z-20" />
            <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 border-none text-white absolute top-1/2 -translate-y-1/2 z-20" />

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-[#0f1221] z-30 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#6324eb] animate-spin" />
                </div>
            )}
        </Carousel>
    )
}
