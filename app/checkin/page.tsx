"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { campaignService } from '@/services';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

/* eslint-disable @typescript-eslint/no-explicit-any */

type CheckinState =
    | 'loading_campaign'
    | 'identify'
    | 'checking_in'
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
    const campaignId = searchParams.get('campaignId');

    const [state, setState] = useState<CheckinState>('loading_campaign');
    const [campaign, setCampaign] = useState<any>(null);
    const [appointment, setAppointment] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [identifierError, setIdentifierError] = useState('');

    // Step 1: Load campaign info
    const loadCampaign = useCallback(async () => {
        if (!campaignId) {
            setState('no_campaign');
            return;
        }

        try {
            const camp = await campaignService.getById(campaignId);
            if (!camp) {
                setState('no_campaign');
                return;
            }
            setCampaign(camp);

            if (camp.status !== 'active') {
                setState('campaign_not_active');
                return;
            }

            // Campaign OK → show identify form
            setState('identify');
        } catch (err: any) {
            console.error('Load campaign error:', err);
            setErrorMessage('Không thể tải thông tin chiến dịch.');
            setState('error');
        }
    }, [campaignId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadCampaign();
    }, [loadCampaign]);

    // Step 2: Identify & check-in
    const handleCheckin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIdentifierError('');

        const trimmed = identifier.trim();
        if (!trimmed) {
            setIdentifierError('Vui lòng nhập số điện thoại hoặc email.');
            return;
        }

        if (!campaignId) return;

        setState('checking_in');

        try {
            // Fetch all registrations for this campaign
            const registrations = await campaignService.getCampaignRegistrations(campaignId);

            // Find matching user by phone or email
            const normalizedInput = trimmed.toLowerCase();
            const userAppointment = registrations?.find((r: any) => {
                const phone = r.user?.phone?.trim() || '';
                const email = r.user?.email?.trim().toLowerCase() || '';
                return phone === trimmed || email === normalizedInput;
            });

            if (!userAppointment) {
                setState('identify');
                setIdentifierError('Không tìm thấy đăng ký nào với thông tin này. Vui lòng kiểm tra lại SĐT hoặc email.');
                return;
            }

            // Check appointment status
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

            // Perform check-in!
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
    };

    // --- Render ---
    return (
        <>
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {state === 'loading_campaign' && <LoadingCard message="Đang tải chiến dịch..." />}
                    {state === 'checking_in' && <LoadingCard message="Đang xử lý check-in..." />}
                    {state === 'identify' && (
                        <IdentifyCard
                            campaign={campaign}
                            identifier={identifier}
                            setIdentifier={setIdentifier}
                            identifierError={identifierError}
                            onSubmit={handleCheckin}
                        />
                    )}
                    {state === 'no_campaign' && <ErrorCard icon="error" title="Không tìm thấy chiến dịch" message="Mã QR không hợp lệ hoặc chiến dịch không tồn tại." />}
                    {state === 'campaign_not_active' && <ErrorCard icon="event_busy" title="Chiến dịch chưa hoạt động" message={`Chiến dịch "${campaign?.name}" hiện không hoạt động.`} />}
                    {state === 'not_registered' && <ErrorCard icon="person_off" title="Chưa đăng ký" message={`Không tìm thấy đăng ký cho chiến dịch "${campaign?.name}".`} />}
                    {state === 'already_checked_in' && <AlreadyCheckedInCard appointment={appointment} campaign={campaign} />}
                    {state === 'already_completed' && <ErrorCard icon="check_circle" title="Đã hoàn thành" message="Bạn đã hoàn thành hiến máu cho chiến dịch này. Cảm ơn bạn!" color="emerald" />}
                    {state === 'already_cancelled' && <ErrorCard icon="cancel" title="Đã hủy" message="Đăng ký cho chiến dịch này đã bị hủy." />}
                    {state === 'success' && <SuccessCard appointment={appointment} campaign={campaign} />}
                    {state === 'error' && <ErrorCard icon="warning" title="Lỗi" message={errorMessage} />}
                </div>
            </div>
        </>
    );
}

// --- Sub-components ---

function LoadingCard({ message }: { message: string }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-10 flex flex-col items-center gap-6 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-blue-500 animate-spin">progress_activity</span>
            </div>
            <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">{message}</p>
        </div>
    );
}

function IdentifyCard({
    campaign,
    identifier,
    setIdentifier,
    identifierError,
    onSubmit,
}: {
    campaign: any;
    identifier: string;
    setIdentifier: (v: string) => void;
    identifierError: string;
    onSubmit: (e: React.FormEvent) => void;
}) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute w-32 h-32 bg-white/10 rounded-full -top-8 -right-8 animate-pulse"></div>
                    <div className="absolute w-20 h-20 bg-white/5 rounded-full bottom-2 left-4 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-3xl">how_to_reg</span>
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight">Check-in Hiến Máu</h2>
                    <p className="text-sm text-white/70 mt-1">{campaign?.name}</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="p-6 space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Nhập số điện thoại hoặc email đã đăng ký
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                            person_search
                        </span>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="VD: 0912345678 hoặc email@gmail.com"
                            className={`w-full pl-11 pr-4 py-3.5 rounded-xl border-2 text-sm transition-all outline-none
                                ${identifierError
                                    ? 'border-red-400 bg-red-50 dark:bg-red-900/10 dark:border-red-500'
                                    : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                }
                                text-slate-900 dark:text-white placeholder:text-slate-400`}
                            autoFocus
                            autoComplete="off"
                        />
                    </div>
                    {identifierError && (
                        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {identifierError}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-center hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                    Check-in ngay
                </button>

                {/* Info */}
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100 dark:border-blue-800/50">
                    <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                        Sử dụng SĐT hoặc email bạn đã dùng khi đăng ký chiến dịch hiến máu này.
                    </p>
                </div>
            </form>
        </div>
    );
}

function ErrorCard({ icon, title, message, color = 'red' }: { icon: string; title: string; message: string; color?: string }) {
    const colorMap: Record<string, { bg: string; iconColor: string }> = {
        red: { bg: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-500' },
        amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-500' },
        emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-500' },
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
                href="/"
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
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Đã check-in rồi!</h2>
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
            </div>
        </div>
    );
}
