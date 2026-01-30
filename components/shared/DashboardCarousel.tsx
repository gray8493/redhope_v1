"use client";
import * as React from "react"
import { AlertCircle, ChevronLeft, ChevronRight, MapPin, Droplets, Calendar, ArrowRight, Loader2 } from "lucide-react";
import Autoplay from "embla-carousel-autoplay"

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { campaignService } from "@/services/campaign.service";
import { toast } from "sonner";
import Link from "next/link";

interface SlideData {
    id: string | number;
    theme: string;
    badge: string;
    badgeColor: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink?: string;
    icon: any;
    imageElement: React.ReactNode;
}

const DEFAULT_SLIDES: SlideData[] = [
    {
        id: 'default-1',
        theme: "blue",
        badge: "CẦN MÁU KHẨN CẤP",
        badgeColor: "bg-red-500",
        title: "Trạng thái Nhóm máu O+",
        description: "Các bệnh viện tại TP.HCM đang thiếu hụt nhóm máu của bạn. Một lần hiến máu của bạn có thể cứu sống 3 người hôm nay.",
        buttonText: "Tìm điểm hiến máu gần nhất",
        buttonLink: "/donate",
        icon: MapPin,
        imageElement: (
            <div className="w-24 h-32 bg-[#1a1f36] rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <div className="absolute top-0 right-0 p-1 opacity-50"><Droplets className="w-8 h-8 text-blue-500" /></div>
                <h2 className="text-4xl font-black text-white mb-1">O+</h2>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Nhóm của bạn</p>
                <div className="absolute bottom-0 w-full h-1 bg-red-500"></div>
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
        const fetchCampaigns = async () => {
            try {
                const campaigns = await campaignService.getActive();
                if (campaigns && campaigns.length > 0) {
                    const campaignSlides: SlideData[] = campaigns.map((campaign: any) => {
                        const startDate = new Date(campaign.start_time);
                        const day = startDate.getDate();
                        const month = startDate.getMonth() + 1; // 0-indexed

                        // Strip HTML tags from description if present
                        const cleanDescription = (campaign.description || "").replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');

                        return {
                            id: campaign.id,
                            theme: "orange",
                            badge: "CHIẾN DỊCH SẮP TỚI",
                            badgeColor: "bg-orange-500",
                            title: campaign.name,
                            description: `${campaign.location_name} • ${startDate.toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}. ${cleanDescription || "Hãy tham gia hiến máu cứu người."}`,
                            buttonText: "Đăng ký ngay",
                            buttonLink: `/campaigns/${campaign.id}`,
                            icon: Calendar,
                            imageElement: (
                                <div className="w-24 h-32 bg-gradient-to-b from-orange-900 to-[#1a1f36] rounded-xl border border-orange-500/30 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                    <div className="absolute top-1 left-1"><Calendar className="w-5 h-5 text-orange-500" /></div>
                                    <h2 className="text-3xl font-black text-orange-400 mb-0 leading-none">{day}</h2>
                                    <p className="text-sm font-bold text-orange-200 uppercase mb-1">Tháng {month}</p>
                                    <div className="w-8 h-0.5 bg-orange-500/50 rounded-full"></div>
                                </div>
                            )
                        };
                    });
                    // Combine default generic slides with real campaigns
                    // Put campaigns first
                    setSlides([...campaignSlides, ...DEFAULT_SLIDES]);
                } else {
                    // Keep defaults if no campaigns
                    setSlides(DEFAULT_SLIDES);
                }
            } catch (error: any) {
                console.error("Failed to fetch campaigns for carousel", error.message || error.details || error);
                // Keep defaults on error
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    return (
        <Carousel
            plugins={[plugin.current]}
            className="w-full h-[300px] rounded-2xl overflow-hidden shadow-xl group bg-[#0f1221] relative"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselContent>
                {slides.map((slide) => (
                    <CarouselItem key={slide.id}>
                        <div className="w-full flex-shrink-0 h-[300px] relative p-8 md:p-10 flex items-center justify-between text-white">
                            {/* Background Effect */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-slate-800 rounded-full filter blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                            <div className="flex flex-col gap-2 max-w-lg z-10">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${slide.badgeColor} opacity-75`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${slide.badgeColor}`}></span>
                                    </span>
                                    <span className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">{slide.badge}</span>
                                </div>

                                <div>
                                    <h2 className="text-xl md:text-2xl font-black tracking-tight mb-1 leading-tight line-clamp-1">{slide.title}</h2>
                                    <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed line-clamp-2">{slide.description}</p>
                                </div>

                                {slide.buttonLink ? (
                                    <Link href={slide.buttonLink}>
                                        <button className="mt-1 w-fit bg-[#6324eb] hover:bg-[#501ac2] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#6324eb]/25 group-hover:translate-x-1">
                                            <slide.icon className="w-3 h-3" />
                                            {slide.buttonText}
                                        </button>
                                    </Link>
                                ) : (
                                    <button className="mt-1 w-fit bg-[#6324eb] hover:bg-[#501ac2] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#6324eb]/25 group-hover:translate-x-1">
                                        <slide.icon className="w-3 h-3" />
                                        {slide.buttonText}
                                    </button>
                                )}
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
