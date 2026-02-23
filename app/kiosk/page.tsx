"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { campaignService } from '@/services';
import { format } from 'date-fns';
import { vi } from "date-fns/locale";

export default function KioskPage() {
    const searchParams = useSearchParams();
    const campaignId = searchParams.get('campaignId');

    const [campaign, setCampaign] = useState<any>(null);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Clock effect
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fullscreen toggle on double click
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => console.log(e));
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    // Data fetching
    const fetchData = async () => {
        if (!campaignId) return;
        try {
            const camp = await campaignService.getById(campaignId);
            setCampaign(camp);

            // Fetch regs
            const regs = await campaignService.getCampaignRegistrations(campaignId);
            setRegistrations(regs || []);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load kiosk data", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // 10s refresh
        return () => clearInterval(interval);
    }, [campaignId]);




    // --- Logic phân loại ---
    // 1. Đang khám (Screening)
    const screening = registrations.find(r => r.status?.toLowerCase() === 'screening' || r.status === 'In-Progress');
    // 2. Đang lấy máu (Donating) - giả sử trạng thái In-Progress cũng có thể là donating nếu có thêm field, ở đây mình demo lấy người thứ 2 In-Progress hoặc người Completed gần nhất
    const donating = registrations.find(r => r.status?.toLowerCase() === 'donating' || (r.status === 'In-Progress' && r.id !== screening?.id));

    // 3. Danh sách chờ (Checked-in / Booked)
    const waitingList = registrations
        .filter(r => ['booked', 'checked-in'].includes(r.status?.toLowerCase()) || (r.status === 'In-Progress' && r.id !== screening?.id && r.id !== donating?.id))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(0, 5);

    if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-cyan-500 font-mono animate-pulse">HỆ THỐNG ĐANG KHỞI ĐỘNG...</div>;
    if (!campaign) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-red-500 font-mono">KHÔNG TÌM THẤY CHIẾN DỊCH_</div>;

    return (
        <div onDoubleClick={toggleFullScreen} className="min-h-[114.28vh] bg-[#020617] text-white flex flex-col relative overflow-hidden font-sans select-none" style={{ zoom: "87.5%" }}>
            {/* Styles inject */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
                @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
                
                :root {
                    --glass-bg: rgba(255, 255, 255, 0.03);
                    --glass-border: rgba(255, 255, 255, 0.12);
                    --neon-blue: #00f2ff;
                    --neon-red: #ff2d55;
                }
                .mesh-gradient {
                    background: 
                        radial-gradient(at 0% 0%, hsla(215, 100%, 15%, 1) 0, transparent 50%),
                        radial-gradient(at 100% 0%, hsla(230, 80%, 10%, 1) 0, transparent 50%),
                        radial-gradient(at 50% 50%, hsla(220, 60%, 5%, 1) 0, transparent 100%);
                }
                .glass-card {
                    background: var(--glass-bg);
                    backdrop-filter: blur(24px);
                    border: 1px solid var(--glass-border);
                    border-top: 1px solid rgba(255,255,255,0.2);
                    border-left: 1px solid rgba(255,255,255,0.2);
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .neon-text-blue {
                    color: var(--neon-blue);
                    text-shadow: 0 0 10px rgba(0, 242, 255, 0.5), 0 0 20px rgba(0, 242, 255, 0.2);
                }
                .neon-text-red {
                    color: var(--neon-red);
                    text-shadow: 0 0 10px rgba(255, 45, 85, 0.5), 0 0 20px rgba(255, 45, 85, 0.2);
                }

                .step-circle {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: inset 0 0 10px rgba(0, 242, 255, 0.2), 0 0 15px rgba(0, 242, 255, 0.1);
                }
                .waitlist-item {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    transform-origin: center top;
                }
                .ticker-wrap {
                    width: 100%;
                    overflow: hidden;
                    background: rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(10px);
                }
                .ticker-move {
                    display: inline-block;
                    white-space: nowrap;
                    padding-right: 100%;
                    animation: ticker 60s linear infinite;
                }
                @keyframes ticker {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-100%, 0, 0); }
                }
                .orb {
                    position: absolute;
                    width: 400px;
                    height: 400px;
                    border-radius: 50%;
                    filter: blur(120px);
                    opacity: 0.15;
                    pointer-events: none;
                }
            `}</style>

            <div className="absolute inset-0 mesh-gradient -z-10"></div>
            <div className="orb bg-cyan-500 top-[-100px] left-[-100px]"></div>
            <div className="orb bg-blue-600 bottom-[-100px] right-[-100px]"></div>
            <div className="orb bg-purple-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"></div>

            {/* Header */}
            <header className="h-24 flex items-center justify-between px-12 relative z-10 border-b border-white/5">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 glass-card flex items-center justify-center border-white/10">
                        <span className="material-symbols-outlined text-3xl neon-text-blue">medical_services</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                            RED<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">HOPE</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">KIOSK</span>
                        </h1>
                        <p className="text-[10px] text-cyan-400/60 uppercase tracking-[0.3em] font-bold">HỆ THỐNG CHECK-IN THÔNG MINH v1.0</p>
                    </div>
                </div>
                <div className="flex items-center gap-12">
                    <div className="text-right">
                        <p className="text-xs text-white/40 font-medium mb-1 uppercase tracking-widest">
                            {format(currentTime, 'dd MMM yyyy', { locale: vi })}
                        </p>
                        <p className="text-3xl font-light tracking-tighter tabular-nums">
                            {format(currentTime, 'HH:mm')}
                            <span className="opacity-40 text-xl">:{format(currentTime, 'ss')}</span>
                        </p>
                    </div>
                    <div className="h-10 w-[1px] bg-white/10"></div>
                    <div className="flex items-center gap-3 glass-card px-5 py-2.5 rounded-full border-green-500/20">
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e] animate-pulse"></div>
                        <span className="text-xs font-bold tracking-widest text-green-500/80 uppercase">HỆ THỐNG SẴN SÀNG</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex p-8 gap-8 overflow-hidden relative z-10">
                {/* Left Panel: Check-in */}
                <section className="flex-[1.2] glass-card p-10 flex flex-col items-center justify-center relative group">
                    <div className="text-center mb-12">
                        <h2 className="text-5xl lg:text-6xl font-extrabold mb-3 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                            Check-in Tức Thì
                        </h2>
                        <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-transparent mx-auto rounded-full mb-4"></div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-10 bg-cyan-500/10 blur-[60px] rounded-full group-hover:bg-cyan-500/20 transition-all duration-700"></div>
                        <div className="glass-card p-12 flex flex-col items-center justify-center border-dashed border-cyan-500/40 border-2">
                            <span className="material-symbols-outlined text-8xl neon-text-blue mb-6">assignment_ind</span>
                            <p className="text-xl font-bold tracking-widest text-white/80 uppercase">Vui lòng đăng ký tại bàn hướng dẫn</p>
                        </div>
                    </div>


                    <div className="mt-16 grid grid-cols-3 gap-12 w-full max-w-xl">
                        {[
                            { step: '01', label: 'Đăng ký' },
                            { step: '02', label: 'Khám sàng lọc' },
                            { step: '03', label: 'Hiến máu' }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-4">
                                <div className="step-circle group-hover:border-cyan-500/50 transition-colors">
                                    <span className="text-cyan-400 font-bold">{item.step}</span>
                                </div>
                                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">{item.label}</span>
                            </div>
                        ))}

                    </div>
                </section>

                {/* Right Panel: Status Board */}
                <section className="flex-1 flex flex-col gap-6">
                    {/* Live Status */}
                    <div className="glass-card p-8 border-cyan-500/20">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-cyan-400">monitoring</span>
                            <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-white/60">Trạng Thái Trực Tuyến</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-8 divide-x divide-white/5">
                            <div className="relative group text-center px-4">
                                <p className="text-[10px] font-black text-cyan-500/60 uppercase tracking-widest mb-4">Đang Khám Sàng Lọc</p>
                                <div className="text-7xl lg:text-8xl font-black leading-none neon-text-blue tracking-tighter drop-shadow-2xl">
                                    {screening ? `#${screening.id.slice(0, 3)}` : '--'}
                                </div>
                                <div className="mt-6 text-[10px] font-bold text-white/30 border border-white/10 inline-block px-3 py-1 rounded">
                                    PHÒNG KHÁM 01
                                </div>
                            </div>
                            <div className="relative group text-center px-4">
                                <p className="text-[10px] font-black text-red-500/60 uppercase tracking-widest mb-4">Đang Lấy Máu</p>
                                <div className="text-7xl lg:text-8xl font-black leading-none neon-text-red tracking-tighter drop-shadow-2xl">
                                    {donating ? `#${donating.id.slice(0, 3)}` : '--'}
                                </div>
                                <div className="mt-6 text-[10px] font-bold text-white/30 border border-white/10 inline-block px-3 py-1 rounded">
                                    GHẾ LẤY MÁU 01
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Waiting List */}
                    <div className="flex-1 flex flex-col overflow-hidden glass-card p-6 border-white/5">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-xs text-white/40">format_list_numbered</span>
                                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Danh sách chờ tiếp theo</h4>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse"></div>
                                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2">
                            {waitingList.map((reg, index) => (
                                <div
                                    key={reg.id}
                                    className="waitlist-item p-4 rounded-xl flex items-center justify-between border border-white/10 bg-white/5 relative overflow-hidden group hover:bg-white/10"
                                    style={{
                                        opacity: Math.max(0.2, 1 - index * 0.2),
                                        transform: `scale(${Math.max(0.9, 1 - index * 0.02)})`
                                    }}
                                >
                                    <div className="flex items-center gap-6 relative z-10">
                                        <span className={`text-3xl font-extrabold tracking-tighter ${index === 0 ? 'text-white' : 'text-white/50'}`}>
                                            #{reg.id.slice(0, 3)}
                                        </span>
                                        <div className="h-6 w-[1px] bg-white/10"></div>
                                        <span className={`text-base font-medium ${index === 0 ? 'text-white' : 'text-white/60'}`}>
                                            {reg.user?.full_name || 'Khách vãng lai'}
                                        </span>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest relative z-10 ${index === 0
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                        : 'bg-white/5 text-white/20 border border-white/5'
                                        }`}>
                                        {index === 0 ? 'Sắp đến' : 'Đang chờ'}
                                    </div>

                                    {/* Scan effect on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </div>
                            ))}

                            {waitingList.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
                                    <span className="material-symbols-outlined text-4xl">inbox</span>
                                    <span className="text-xs tracking-widest uppercase">Hàng chờ trống</span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer Ticker */}
            <footer className="h-12 ticker-wrap flex items-center border-t border-white/5 relative z-20">
                <div className="ticker-move text-xs font-medium tracking-[0.1em] text-white/60 uppercase py-2">
                    <span className="mx-16 flex items-center gap-3 inline-flex">
                        <span className="material-symbols-outlined text-cyan-400 text-sm">info</span>
                        Lưu ý: Vui lòng chuẩn bị Căn cước công dân gắn chip hoặc ứng dụng VNeID mức 2 khi làm thủ tục.
                    </span>
                    <span className="mx-16 flex items-center gap-3 inline-flex">
                        <span className="material-symbols-outlined text-red-400 text-sm">favorite</span>
                        Mỗi giọt máu cho đi, một cuộc đời ở lại — Cảm ơn nghĩa cử cao đẹp của bạn.
                    </span>
                    <span className="mx-16 flex items-center gap-3 inline-flex">
                        <span className="material-symbols-outlined text-cyan-400 text-sm">verified_user</span>
                        Quy trình hiến máu đảm bảo an toàn tuyệt đối theo tiêu chuẩn của Bộ Y Tế.
                    </span>
                    <span className="mx-16 flex items-center gap-3 inline-flex">
                        <span className="material-symbols-outlined text-amber-400 text-sm">bolt</span>
                        Địa điểm: {campaign?.location_name || 'Đang cập nhật...'}
                    </span>
                </div>
            </footer>
        </div>
    );
}
