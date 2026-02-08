"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import MiniFooter from "@/components/shared/MiniFooter";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { startOfMonth, startOfQuarter, startOfYear, isAfter, isBefore, format, subMonths, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfDay, endOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

export default function ReportsPage() {
    const { user } = useAuth();
    const [timeFilter, setTimeFilter] = useState<'month' | 'quarter' | 'year'>('month');
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const [rawData, setRawData] = useState<{
        campaigns: any[];
        appointments: any[];
    }>({ campaigns: [], appointments: [] });

    // Constants for Chart Colors
    const chartColors = {
        student: "#0065FF", // Blue
        office: "#10b981",  // Emerald
        freelance: "#f59e0b", // Amber
        other: "#cbd5e1",   // Slate
        fb: "#4267B2",
        school: "#EF4444",
        friends: "#F59E0B",
        zalo: "#0068FF"
    };

    const getFunnelWidth = (val: number, max: number) => {
        if (max === 0) return "5%";
        return `${Math.max((val / max) * 100, 5)}%`;
    };

    // --- 1. Fetch Data ---
    useEffect(() => {
        if (!user?.id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Campaigns
                const { data: campaigns, error: campError } = await supabase
                    .from('campaigns')
                    .select('id, name, start_time, end_time, target_units')
                    .eq('hospital_id', user.id);

                if (campError) throw campError;

                // Fetch Appointments (Deep fetch for demographics)
                const campaignIds = campaigns?.map(c => c.id) || [];

                if (campaignIds.length === 0) {
                    setRawData({ campaigns: [], appointments: [] });
                    return;
                }

                const { data: appointments, error: appError } = await supabase
                    .from('appointments')
                    .select(`
                        id,
                        status,
                        created_at,
                        campaign_id,
                        user:users (
                            id,
                            dob,
                            gender,
                            address,
                            last_donation_date
                        )
                    `)
                    .in('campaign_id', campaignIds);

                if (appError) throw appError;

                setRawData({ campaigns: campaigns || [], appointments: appointments || [] });

            } catch (err: any) {
                console.error("Error fetching report data:", err);
                toast.error("Không thể tải dữ liệu báo cáo");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    // --- 2. Process Data based on Filter ---
    const metricsData = useMemo(() => {
        const now = new Date();
        let startDate = startOfMonth(now);

        if (timeFilter === 'quarter') startDate = startOfQuarter(now);
        if (timeFilter === 'year') startDate = startOfYear(now);

        // Filter appointments in range
        const filteredApps = rawData.appointments.filter(app => {
            const date = new Date(app.created_at);
            return isAfter(date, startDate) && isBefore(date, now);
        });

        // 1. Funnel Metrics
        const totalRegistered = filteredApps.length;
        const totalCompleted = filteredApps.filter(a => a.status === 'Completed').length;
        const totalDeferred = filteredApps.filter(a => a.status === 'Deferred').length;
        const totalArrived = totalCompleted + totalDeferred;
        const totalNoShow = Math.max(0, totalRegistered - totalArrived);

        // Rates
        const returningDonors = filteredApps.filter(a => a.user?.last_donation_date).length;
        const retentionRate = totalArrived > 0 ? Math.round((returningDonors / totalArrived) * 100) : 0;
        const deferralRate = totalArrived > 0 ? Math.round((totalDeferred / totalArrived) * 100) : 0;
        const noShowRate = totalRegistered > 0 ? Math.round((totalNoShow / totalRegistered) * 100) : 0;

        // Growth (Mocked)
        const retentionGrowth = "+2.5%";
        const deferralGrowth = "-1.0%";
        const noShowGrowth = "-0.5%";

        // 2. Demographics (Age Groups)
        const ageGroups = {
            student: 0,
            office: 0,
            freelance: 0,
            other: 0
        };

        filteredApps.forEach(app => {
            if (!app.user?.dob) {
                ageGroups.other++;
                return;
            }
            const dob = new Date(app.user.dob);
            const age = now.getFullYear() - dob.getFullYear();

            if (age < 23) ageGroups.student++;
            else if (age < 35) ageGroups.office++;
            else if (age < 50) ageGroups.freelance++;
            else ageGroups.other++;
        });

        const totalDemo = totalRegistered || 1;
        const demographics = [
            { label: "Sinh viên (<23t)", pct: Math.round((ageGroups.student / totalDemo) * 100), color: "bg-blue-600" },
            { label: "Văn phòng (23-35t)", pct: Math.round((ageGroups.office / totalDemo) * 100), color: "bg-emerald-400" },
            { label: "Trung niên (35-50t)", pct: Math.round((ageGroups.freelance / totalDemo) * 100), color: "bg-orange-400" },
            { label: "Khác (>50t)", pct: Math.round((ageGroups.other / totalDemo) * 100), color: "bg-slate-300" }
        ];

        // 3. Source (Mocked)
        const source = [
            { label: "Facebook", count: Math.round(totalRegistered * 0.4), pct: 40 },
            { label: "Trường học", count: Math.round(totalRegistered * 0.3), pct: 30 },
            { label: "Bạn bè", count: Math.round(totalRegistered * 0.2), pct: 20 },
            { label: "Zalo/SMS", count: Math.round(totalRegistered * 0.1), pct: 10 }
        ];

        // 4. Time Series Data for Line Chart
        let intervals: Date[] = [];
        let dateFormat = "dd/MM";

        if (timeFilter === 'month') {
            intervals = eachDayOfInterval({ start: startDate, end: now });
            dateFormat = "dd/MM";
        } else if (timeFilter === 'quarter') {
            intervals = eachWeekOfInterval({ start: startDate, end: now });
            dateFormat = "'Tuần' w";
        } else {
            intervals = eachMonthOfInterval({ start: startDate, end: now });
            dateFormat = "MMM";
        }

        const timeSeriesData = intervals.map(date => {
            const dayStart = startOfDay(date);
            const dayEnd = timeFilter === 'month' ? endOfDay(date) :
                timeFilter === 'quarter' ? endOfDay(new Date(date.getTime() + 6 * 24 * 60 * 60 * 1000)) :
                    endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));

            const dayApps = rawData.appointments.filter(app => {
                const appDate = new Date(app.created_at);
                return appDate >= dayStart && appDate <= dayEnd;
            });

            return {
                date: format(date, dateFormat, { locale: vi }),
                registrations: dayApps.length,
                completed: dayApps.filter(a => a.status === 'Completed').length,
                deferred: dayApps.filter(a => a.status === 'Deferred').length,
            };
        });

        return {
            retentionRate, retentionGrowth, isPositive: true,
            deferralRate, deferralGrowth, isdeferralGood: true,
            noShowRate, noShowGrowth, isNoShowGood: true,
            funnel: {
                registered: totalRegistered,
                arrived: totalArrived,
                screeningPass: totalCompleted,
                collected: totalCompleted
            },
            demographics,
            source,
            timeSeriesData
        };

    }, [rawData, timeFilter]);

    // --- Export Functions ---
    const exportToCSV = () => {
        setExporting(true);
        try {
            const { funnel, demographics, source, timeSeriesData } = metricsData;

            let csvContent = "data:text/csv;charset=utf-8,";

            // Header
            csvContent += "BÁO CÁO HIỆU QUẢ CHIẾN DỊCH HIẾN MÁU\n";
            csvContent += `Thời gian: ${timeFilter === 'month' ? 'Tháng này' : timeFilter === 'quarter' ? 'Quý này' : 'Năm nay'}\n\n`;

            // Funnel metrics
            csvContent += "THỐNG KÊ CHUYỂN ĐỔI\n";
            csvContent += "Giai đoạn,Số lượng\n";
            csvContent += `Đăng ký trực tuyến,${funnel.registered}\n`;
            csvContent += `Check-in (Có mặt),${funnel.arrived}\n`;
            csvContent += `Khám sàng lọc,${funnel.screeningPass}\n`;
            csvContent += `Hiến máu thành công,${funnel.collected}\n\n`;

            // Demographics
            csvContent += "NHÂN KHẨU HỌC\n";
            csvContent += "Độ tuổi,Tỷ lệ (%)\n";
            demographics.forEach(d => {
                csvContent += `${d.label},${d.pct}\n`;
            });
            csvContent += "\n";

            // Time Series
            csvContent += "DỮ LIỆU THEO THỜI GIAN\n";
            csvContent += "Ngày,Đăng ký,Hoàn thành,Hoãn\n";
            timeSeriesData.forEach(d => {
                csvContent += `${d.date},${d.registrations},${d.completed},${d.deferred}\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `bao-cao-hien-mau-${format(new Date(), 'dd-MM-yyyy')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Đã xuất báo cáo CSV thành công!");
        } catch (error) {
            toast.error("Lỗi khi xuất báo cáo");
        } finally {
            setExporting(false);
        }
    };

    const exportToPDF = async () => {
        setExporting(true);
        try {
            // Dynamic import for client-side only
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            if (!reportRef.current) return;

            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`bao-cao-hien-mau-${format(new Date(), 'dd-MM-yyyy')}.pdf`);

            toast.success("Đã xuất báo cáo PDF thành công!");
        } catch (error) {
            console.error("PDF export error:", error);
            toast.error("Lỗi khi xuất PDF. Vui lòng thử lại.");
        } finally {
            setExporting(false);
        }
    };


    if (loading) {
        return (
            <main className="flex-1 p-10 space-y-8 bg-slate-50 dark:bg-slate-900 w-full overflow-y-auto">
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
                </div>
                <Skeleton className="h-96 rounded-2xl" />
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-900 w-full font-sans">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif; }
                .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
                .shadow-soft { box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); }
            `}</style>

            <div ref={reportRef} className="p-10 space-y-8 max-w-[1600px] mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex gap-2 mb-2">
                            <button onClick={() => setTimeFilter('month')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === 'month' ? 'bg-white dark:bg-slate-800 shadow-soft text-[#0065FF]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Tháng này</button>
                            <button onClick={() => setTimeFilter('quarter')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === 'quarter' ? 'bg-white dark:bg-slate-800 shadow-soft text-[#0065FF]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Quý này</button>
                            <button onClick={() => setTimeFilter('year')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === 'year' ? 'bg-white dark:bg-slate-800 shadow-soft text-[#0065FF]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Năm nay</button>
                        </div>
                        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Phân tích Hiệu quả Chiến dịch</h3>
                        <p className="text-slate-500 font-medium">Theo dõi dòng chảy người hiến và chỉ số nhân khẩu học theo thời gian thực.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportToCSV}
                            disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Excel/CSV
                        </button>
                        <button
                            onClick={exportToPDF}
                            disabled={exporting}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#0065FF] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            <FileText className="w-4 h-4" />
                            {exporting ? "Đang xuất..." : "Xuất PDF"}
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl shadow-soft border border-slate-50 dark:border-slate-800 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute right-0 top-0 size-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-blue-500/10 transition-colors"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                <span className="material-symbols-outlined">sync_alt</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ Quay lại</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{metricsData.retentionRate}%</p>
                            <span className="text-green-500 text-sm font-bold flex items-center">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                {metricsData.retentionGrowth}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Người hiến quay lại từ đợt trước</p>
                    </div>
                    <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl shadow-soft border border-slate-50 dark:border-slate-800 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute right-0 top-0 size-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-blue-500/10 transition-colors"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                <span className="material-symbols-outlined">medical_services</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ Hoãn hiến</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{metricsData.deferralRate}%</p>
                            <span className={`text-sm font-bold flex items-center ${metricsData.isdeferralGood ? 'text-green-500' : 'text-rose-500'}`}>
                                <span className="material-symbols-outlined text-sm">{metricsData.isdeferralGood ? 'trending_down' : 'trending_up'}</span>
                                {metricsData.deferralGrowth}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Hoãn do kiểm tra sức khỏe tại chỗ</p>
                    </div>
                    <div className="bg-white dark:bg-[#1c162e] p-6 rounded-2xl shadow-soft border border-slate-50 dark:border-slate-800 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute right-0 top-0 size-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-blue-500/10 transition-colors"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                <span className="material-symbols-outlined">person_off</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ Vắng mặt</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{metricsData.noShowRate}%</p>
                            <span className={`text-sm font-bold ${metricsData.isNoShowGood ? 'text-green-500' : 'text-blue-500'}`}>{metricsData.noShowGrowth}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Đăng ký nhưng không check-in</p>
                    </div>
                </div>

                {/* NEW: Time Series Line Chart */}
                <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl shadow-soft border border-slate-50 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Xu hướng Đăng ký theo Thời gian</h4>
                            <p className="text-sm text-slate-500">Biểu đồ thống kê số lượng đăng ký, hoàn thành và hoãn hiến</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={metricsData.timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0065FF" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0065FF" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="registrations" name="Đăng ký" stroke="#0065FF" fillOpacity={1} fill="url(#colorReg)" strokeWidth={2} />
                            <Area type="monotone" dataKey="completed" name="Hoàn thành" stroke="#10b981" fillOpacity={1} fill="url(#colorComp)" strokeWidth={2} />
                            <Line type="monotone" dataKey="deferred" name="Hoãn" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-7 bg-white dark:bg-[#1c162e] p-8 rounded-2xl shadow-soft border border-slate-50 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Dòng chảy Chuyển đổi Người hiến</h4>
                                <p className="text-sm text-slate-500">Hành trình từ đăng ký đến thành công</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-[#0065FF]">{metricsData.funnel.registered > 0 ? Math.round((metricsData.funnel.collected / metricsData.funnel.registered) * 100) : 0}%</span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Tỷ lệ chuyển đổi</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            {[
                                { label: "1. Đăng ký Trực tuyến", val: metricsData.funnel.registered, pct: "100%", sub: "Tổng lượng", color: "bg-blue-100 dark:bg-blue-900/40", textColor: "text-blue-700 dark:text-blue-300" },
                                { label: "2. Check-in (Có mặt)", val: metricsData.funnel.arrived, pct: getFunnelWidth(metricsData.funnel.arrived, metricsData.funnel.registered), sub: `${metricsData.funnel.registered > 0 ? Math.round((metricsData.funnel.arrived / metricsData.funnel.registered) * 100) : 0}% Giữ chân`, color: "bg-blue-300 dark:bg-blue-700", textColor: "text-blue-900 dark:text-blue-100" },
                                { label: "3. Khám Sàng lọc", val: metricsData.funnel.screeningPass, pct: getFunnelWidth(metricsData.funnel.screeningPass, metricsData.funnel.registered), sub: `${metricsData.funnel.registered > 0 ? Math.round((metricsData.funnel.screeningPass / metricsData.funnel.registered) * 100) : 0}% Đạt chuẩn`, color: "bg-[#0065FF]", textColor: "text-white" },
                                { label: "4. Hiến máu Thành công", val: metricsData.funnel.collected, pct: getFunnelWidth(metricsData.funnel.collected, metricsData.funnel.registered), sub: `${metricsData.funnel.registered > 0 ? Math.round((metricsData.funnel.collected / metricsData.funnel.registered) * 100) : 0}% Thành công`, color: "bg-emerald-500", textColor: "text-white" }
                            ].map((step, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-600 dark:text-slate-400">{step.label}</span>
                                        <span className="text-slate-900 dark:text-white font-extrabold">{step.val} người</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-10 rounded-xl overflow-hidden relative">
                                        <div className={`h-full transition-all duration-700 ${step.color}`} style={{ width: step.pct }}></div>
                                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase ${idx > 0 && idx < 2 ? 'text-blue-800' : step.textColor}`}>
                                            {step.sub}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-slate-400 italic text-center">Dữ liệu được cập nhật dựa trên các chiến dịch hiến máu đang hoạt động.</p>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-5 space-y-8">
                        {/* Demographics */}
                        <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl shadow-soft border border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                                    <span className="material-symbols-outlined">groups</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Nhân khẩu học (Độ tuổi)</h4>
                            </div>
                            <div className="space-y-6">
                                {metricsData.demographics.map((demo, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{demo.label}</span>
                                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">{demo.pct}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div className={`h-full ${demo.color}`} style={{ width: `${demo.pct}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Referral Sources */}
                        <div className="bg-white dark:bg-[#1c162e] p-8 rounded-2xl shadow-soft border border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="size-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600">
                                    <span className="material-symbols-outlined">share</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Nguồn giới thiệu (Mô phỏng)</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {metricsData.source.map((src, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{src.label}</p>
                                        <p className="text-xl font-extrabold text-slate-900 dark:text-white">{src.pct}%</p>
                                        <p className="text-[10px] text-slate-500 mt-1">{src.count} Người</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                <MiniFooter />
            </div>
        </main>
    );
}
