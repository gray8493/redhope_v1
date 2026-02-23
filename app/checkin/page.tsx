"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { campaignService } from '@/services';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

/* eslint-disable @typescript-eslint/no-explicit-any */

type CheckinState =
    | 'loading'
    | 'not_logged_in'
    | 'no_campaign'
    | 'not_registered'
    | 'already_checked_in'
    | 'already_completed'
    | 'already_cancelled'
    | 'campaign_not_active'
    | 'success'
    | 'error';

export default function CheckinPage() {
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const campaignId = searchParams.get('campaignId');

    const [state, setState] = useState<CheckinState>('loading');
    const [campaign, setCampaign] = useState<any>(null);
    const [appointment, setAppointment] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const hasRun = useRef(false);

    const performCheckin = useCallback(async () => {
        if (authLoading) return;

        // 1. Check login
        if (!user) {
            setState('not_logged_in');
            return;
        }

        // 2. Check campaignId
        if (!campaignId) {
            setState('no_campaign');
            return;
        }

        try {
            // 3. Fetch campaign info
            const camp = await campaignService.getById(campaignId);
            if (!camp) {
                setState('no_campaign');
                return;
            }
            setCampaign(camp);

            // 4. Check campaign status
            if (camp.status !== 'active') {
                setState('campaign_not_active');
                return;
            }

            // 5. Find user's appointment in this campaign
            const registrations = await campaignService.getCampaignRegistrations(campaignId);
            const userAppointment = registrations?.find(
                (r: any) => r.user_id === user.id
            );

            if (!userAppointment) {
                setState('not_registered');
                return;
            }

            // 6. Check appointment status
            const status = userAppointment.status?.toLowerCase();

            if (status === 'checked-in') {
                setAppointment(userAppointment);
                setState('already_checked_in');
                return;
            }

            if (status === 'completed') {
                setState('already_completed');
                return;
            }

            if (status === 'cancelled' || status === 'rejected') {
                setState('already_cancelled');
                return;
            }

            if (status !== 'booked') {
                setErrorMessage(`Trạng thái không hợp lệ: ${userAppointment.status}`);
                setState('error');
                return;
            }

            // 7. Perform check-in!
            const result = await campaignService.checkInRegistration(
                userAppointment.id,
                campaignId
            );

            setAppointment(result);
            setState('success');

        } catch (err: any) {
            console.error('Check-in error:', err);
            setErrorMessage(err.message || 'Đã xảy ra lỗi khi check-in');
            setState('error');
        }
    }, [user, campaignId, authLoading]);

    useEffect(() => {
        if (!hasRun.current) {
            hasRun.current = true;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            performCheckin();
        }
    }, [performCheckin]);

    // --- Render based on state ---
    return (
        <>
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {state === 'loading' && <LoadingCard />}
                    {state === 'not_logged_in' && <NotLoggedInCard campaignId={campaignId} />}
                    {state === 'no_campaign' && <ErrorCard icon="error" title="Không tìm thấy chiến dịch" message="Mã QR không hợp lệ hoặc chiến dịch không tồn tại." />}
                    {state === 'campaign_not_active' && <ErrorCard icon="event_busy" title="Chiến dịch chưa hoạt động" message={`Chiến dịch "${campaign?.name}" hiện không hoạt động.`} />}
                    {state === 'not_registered' && <ErrorCard icon="person_off" title="Chưa đăng ký" message={`Bạn chưa đăng ký chiến dịch "${campaign?.name}". Vui lòng đăng ký trước khi check-in.`} />}
                    {state === 'already_checked_in' && <AlreadyCheckedInCard appointment={appointment} campaign={campaign} />}
                    {state === 'already_completed' && <ErrorCard icon="check_circle" title="Đã hoàn thành" message="Bạn đã hoàn thành hiến máu cho chiến dịch này. Cảm ơn bạn!" color="emerald" />}
                    {state === 'already_cancelled' && <ErrorCard icon="cancel" title="Đã hủy" message="Đăng ký của bạn cho chiến dịch này đã bị hủy." />}
                    {state === 'success' && <SuccessCard appointment={appointment} campaign={campaign} />}
                    {state === 'error' && <ErrorCard icon="warning" title="Lỗi" message={errorMessage} />}
                </div>
            </div>
        </>
    );
}

// --- Sub-components ---

function LoadingCard() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-10 flex flex-col items-center gap-6 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-blue-500 animate-spin">progress_activity</span>
            </div>
            <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">Đang xử lý check-in...</p>
        </div>
    );
}

function NotLoggedInCard({ campaignId }: { campaignId: string | null }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-10 flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-amber-500">login</span>
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Vui lòng đăng nhập</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Bạn cần đăng nhập để check-in chiến dịch hiến máu.</p>
            </div>
            <Link
                href={`/auth/login?redirect=/checkin?campaignId=${campaignId}`}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-2xl text-center hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/25"
            >
                Đăng nhập ngay
            </Link>
        </div>
    );
}

function ErrorCard({ icon, title, message, color = 'red' }: { icon: string; title: string; message: string; color?: string }) {
    const colorMap: Record<string, { bg: string; text: string; iconColor: string }> = {
        red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-500', iconColor: 'text-red-500' },
        amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-500', iconColor: 'text-amber-500' },
        emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-500', iconColor: 'text-emerald-500' },
    };
    const c = colorMap[color] || colorMap.red;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-10 flex flex-col items-center gap-6 text-center">
            <div className={`w-20 h-20 rounded-full ${c.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-4xl ${c.iconColor}`}>{icon}</span>
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
            </div>
            <Link
                href="/dashboard"
                className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
                ← Quay về trang chủ
            </Link>
        </div>
    );
}

function AlreadyCheckedInCard({ appointment, campaign }: { appointment: any; campaign: any }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-10 flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-purple-500">how_to_reg</span>
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Bạn đã check-in rồi!</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Chiến dịch: {campaign?.name}</p>
            </div>
            <div className="w-full bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800">
                <p className="text-xs text-purple-500 dark:text-purple-400 font-bold uppercase tracking-widest mb-2">Số thứ tự của bạn</p>
                <p className="text-6xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                    #{String(appointment?.queue_number || '?').padStart(2, '0')}
                </p>
                {appointment?.check_in_time && (
                    <p className="text-xs text-purple-400 dark:text-purple-500 mt-3">
                        Check-in lúc {format(new Date(appointment.check_in_time), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                    </p>
                )}
            </div>
            <Link
                href="/dashboard"
                className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
                ← Quay về trang chủ
            </Link>
        </div>
    );
}

function SuccessCard({ appointment, campaign }: { appointment: any; campaign: any }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            {/* Success header with animation */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 flex flex-col items-center text-white relative overflow-hidden">
                {/* Animated circles */}
                <div className="absolute inset-0">
                    <div className="absolute w-32 h-32 bg-white/10 rounded-full -top-8 -right-8 animate-pulse"></div>
                    <div className="absolute w-24 h-24 bg-white/5 rounded-full bottom-0 left-4 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm animate-bounce" style={{ animationDuration: '1.5s' }}>
                        <span className="material-symbols-outlined text-5xl">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight">Check-in thành công!</h2>
                    <p className="text-sm text-white/80">{campaign?.name}</p>
                </div>
            </div>

            {/* Queue number */}
            <div className="p-8 flex flex-col items-center gap-6">
                <div className="w-full bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-8 border border-emerald-100 dark:border-emerald-800 text-center">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-[0.2em] mb-3">Số thứ tự của bạn</p>
                    <p className="text-7xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                        #{String(appointment?.queue_number || '?').padStart(2, '0')}
                    </p>
                    {appointment?.check_in_time && (
                        <p className="text-xs text-emerald-500/60 dark:text-emerald-500/40 mt-4">
                            {format(new Date(appointment.check_in_time), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                        </p>
                    )}
                </div>

                {/* Campaign info */}
                <div className="w-full space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <span className="material-symbols-outlined text-lg text-blue-500">location_on</span>
                        <span>{campaign?.location_name || 'Đang cập nhật'}</span>
                    </div>
                    {campaign?.start_time && (
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined text-lg text-amber-500">schedule</span>
                            <span>
                                {format(new Date(campaign.start_time), 'HH:mm', { locale: vi })}
                                {campaign.end_time && ` - ${format(new Date(campaign.end_time), 'HH:mm', { locale: vi })}`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Next steps */}
                <div className="w-full bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">📋 Bước tiếp theo</p>
                    <p className="text-xs text-blue-500 dark:text-blue-400/70">Vui lòng chờ gọi số thứ tự và đến phòng khám sàng lọc.</p>
                </div>

                <Link
                    href="/dashboard"
                    className="w-full py-3 px-6 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl text-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-sm"
                >
                    Quay về trang chủ
                </Link>
            </div>
        </div>
    );
}
