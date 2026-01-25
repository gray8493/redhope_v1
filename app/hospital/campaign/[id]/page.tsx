"use client";

import React, { useState, useEffect } from 'react';
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { getCampaignById, updateCampaign, Campaign, getCampaigns, Appointment } from "@/app/utils/campaignStorage";



const DEFAULT_APPOINTMENTS = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        type: "Người hiến thường xuyên",
        code: "NV",
        blood: "O+ (O DƯƠNG)",
        bloodClass: "px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100 uppercase",
        time: "10:30",
        status: "Hoàn thành",
        statusClass: "px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded",
        donated: 0.45
    },
    {
        id: 2,
        name: "Trần Thị B",
        type: "Người hiến mới",
        code: "TT",
        blood: "A+ (A DƯƠNG)",
        bloodClass: "px-2 py-0.5 bg-slate-50 text-slate-600 text-xs font-bold rounded border border-slate-100 uppercase",
        time: "11:15",
        status: "Đang tiến hành",
        statusClass: "px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded",
        donated: undefined
    },
    {
        id: 3,
        name: "Lê Hoàng C",
        type: "Thành viên Doanh nghiệp",
        code: "LH",
        blood: "O- (O ÂM)",
        bloodClass: "px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100 uppercase",
        time: "11:45",
        status: "Đang chờ",
        statusClass: "px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded",
        donated: undefined
    },
    {
        id: 4,
        name: "Phạm Thùy Z",
        type: "Người hiến thường xuyên",
        code: "PT",
        blood: "B+ (B DƯƠNG)",
        bloodClass: "px-2 py-0.5 bg-slate-50 text-slate-600 text-xs font-bold rounded border border-slate-100 uppercase",
        time: "12:30",
        status: "Đã đặt lịch",
        statusClass: "px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded",
        donated: undefined
    },
    {
        id: 5,
        name: "Trần Văn D",
        type: "Người hiến mới",
        code: "TD",
        blood: "O+ (O DƯƠNG)",
        bloodClass: "px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100 uppercase",
        time: "13:00",
        status: "Đang chờ",
        statusClass: "px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded",
        donated: undefined
    },
    {
        id: 6,
        name: "Nguyễn Thị E",
        type: "Người hiến thường xuyên",
        code: "NE",
        blood: "A+ (A DƯƠNG)",
        bloodClass: "px-2 py-0.5 bg-slate-50 text-slate-600 text-xs font-bold rounded border border-slate-100 uppercase",
        time: "13:15",
        status: "Đã đặt lịch",
        statusClass: "px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded",
        donated: undefined
    },
    {
        id: 7,
        name: "Lê Văn F",
        type: "Thành viên Doanh nghiệp",
        code: "LF",
        blood: "B+ (B DƯƠNG)",
        bloodClass: "px-2 py-0.5 bg-slate-50 text-slate-600 text-xs font-bold rounded border border-slate-100 uppercase",
        time: "13:30",
        status: "Hoàn thành",
        statusClass: "px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded",
        donated: 0.35
    },
    {
        id: 8,
        name: "Phạm Thị G",
        type: "Người hiến mới",
        code: "PG",
        blood: "AB+ (AB DƯƠNG)",
        bloodClass: "px-2 py-0.5 bg-slate-50 text-slate-600 text-xs font-bold rounded border border-slate-100 uppercase",
        time: "13:45",
        status: "Đang tiến hành",
        statusClass: "px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded",
        donated: undefined
    },
    {
        id: 9,
        name: "Hoàng Van H",
        type: "Người hiến thường xuyên",
        code: "HH",
        blood: "O- (O ÂM)",
        bloodClass: "px-2 py-0.5 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100 uppercase",
        time: "14:00",
        status: "Đang chờ",
        statusClass: "px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded",
        donated: undefined
    },
    {
        id: 10,
        name: "Vũ Thị I",
        type: "Người hiến mới",
        code: "VI",
        blood: "A- (A ÂM)",
        bloodClass: "px-2 py-0.5 bg-slate-50 text-slate-600 text-xs font-bold rounded border border-slate-100 uppercase",
        time: "14:15",
        status: "Đã đặt lịch",
        statusClass: "px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded",
        donated: undefined
    },
];

export default function CampaignDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    // Campaign State - Default fallback
    const [campaignInfo, setCampaignInfo] = useState<Campaign>({
        id: 1,
        name: "Đợt Khẩn cấp Nhóm máu O+",
        desc: "",
        date: "12/10 - 15/10/2024",
        location: "Sảnh chính, Tháp A",
        staffCount: 12,
        status: "Đang hoạt động",
        operationalStatus: "Đang hoạt động",
        target: 50, // Liters
        bloodTypes: ["O+"],
        bloodType: "O+",
        bloodClass: "",
        statusClass: "",
        isUrgent: true,
        timeLeft: "",
        progress: 0,
        current: 0,
        image: ""
    });

    // Navigation State
    const [prevId, setPrevId] = useState<number | null>(null);
    const [nextId, setNextId] = useState<number | null>(null);

    // Load from storage
    useEffect(() => {
        if (!id) return;

        const stored = getCampaignById(id);
        if (stored) {
            setCampaignInfo(prev => ({
                ...prev,
                ...stored,
                operationalStatus: stored.operationalStatus || "Đang hoạt động"
            }));

            // Load stored appointments if they exist, otherwise keep the default mock ones
            if (stored.appointments && stored.appointments.length > 0) {
                setAppointments(stored.appointments);
            } else {
                setAppointments(DEFAULT_APPOINTMENTS);
            }
        } else {
            setAppointments(DEFAULT_APPOINTMENTS);
        }
        setIsLoaded(true);

        // Determine Prev/Next IDs
        const allCampaigns = getCampaigns();
        const currentIndex = allCampaigns.findIndex(c => c.id === id);
        if (currentIndex !== -1) {
            setPrevId(currentIndex > 0 ? allCampaigns[currentIndex - 1].id : null);
            setNextId(currentIndex < allCampaigns.length - 1 ? allCampaigns[currentIndex + 1].id : null);
        }

    }, [id]);

    const goToCampaign = (newId: number) => {
        router.push(`/hospital/campaign/${newId}`);
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEndModalOpen, setIsEndModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<Campaign>(campaignInfo);

    // Update edit form when modal opens
    useEffect(() => {
        if (isEditModalOpen) {
            setEditForm({ ...campaignInfo, operationalStatus: campaignInfo.operationalStatus || "Đang hoạt động" });
        }
    }, [isEditModalOpen, campaignInfo]);


    const bloodTypeOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    // Mock data for appointments
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const [statusFilter, setStatusFilter] = useState<string>("Tất cả");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 4;
    const statusOptions = ["Tất cả", "Hoàn thành", "Đang tiến hành", "Đang chờ", "Đã đặt lịch"];
    // Sắp xếp tên theo A-Z trước khi phân trang
    const sortedAppointments = [...appointments].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
    const filteredAppointments = statusFilter === "Tất cả" ? sortedAppointments : sortedAppointments.filter(a => a.status === statusFilter);
    const totalPages = Math.ceil(filteredAppointments.length / pageSize);
    const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // --- Calculated Metrics ---
    const targetVolume = campaignInfo.target;
    // Let's assume the goal is 50 Units (events) for the first card progress bar context typically, 
    // BUT the user asked for "Tong luong mau da hien" (Total volume).
    // Let's stick to the visual: "42/50 Đơn vị" usually suggests count. 
    // However, the user request says: "Tiến độ mục tiêu: Sẽ tự động cộng tổng lượng máu đã hiến". 
    // So "Đơn vị" here implies VOLUME/UNITS collected.

    const completedAppointments = appointments.filter(a => a.status === "Hoàn thành");
    const totalCollected = completedAppointments.reduce((sum, a) => sum + (a.donated || 0), 0);

    // Progress for "Tiến độ mục tiêu" (Goal Progress)
    // Assuming targetAmount is in same unit as totalCollected (Liters or Standard Units). 
    // If user inputs 0.45 (L), and target is 50 (Units), this might be mismatched. 
    // NOTE: Usually 50 Units = 50 bags. 1 bag ~ 250-450ml. 
    // To match the existing UI "42/50", let's assume we count *completed donations* for the "Units" progress 
    // OR we sum the volume. 
    // User said: "cộng tổng lượng máu". Let's use totalCollected (Volume).
    // If target is 50 Liters, then 0.45L is tiny. 
    // If target is 50 Units (people), and user wants "Amount" sum, we might need a separate "Volume" card.
    // BUT, the request says "Tiến độ mục tiêu ... cộng tổng lượng máu". 
    // So I will change the display to "X / 50 Lít" (Liters) to be consistent with "lượng máu".
    const progressPercent = Math.min((totalCollected / targetVolume) * 100, 100);
    const remaining = Math.max(targetVolume - totalCollected, 0);

    // Analysis Logic
    const deficit = remaining;
    const isGoodProgress = progressPercent >= 50; // Simple heuristic
    const analysisAssessment = isGoodProgress ? "Tốt" : "Cần cố gắng";
    const analysisColor = isGoodProgress ? "text-emerald-500" : "text-amber-500";
    const analysisIcon = isGoodProgress ? "trending_up" : "trending_down";

    // Registration Count
    const totalRegistered = appointments.length;

    // Check if campaign is ended
    const isEnded = campaignInfo.operationalStatus === "Đã kết thúc" || campaignInfo.status === "Đã kết thúc";

    // Sync calculated progress to globally stored campaign data
    useEffect(() => {
        if (!campaignInfo.id || !isLoaded) return;

        // Calculate totals from local appointments
        const completedApps = appointments.filter(a => a.status === "Hoàn thành");
        const calculatedCurrent = completedApps.reduce((sum, a) => sum + (a.donated || 0), 0);
        const newCompletedCount = completedApps.length;
        const newRegisteredCount = appointments.length;

        // Avoid infinite loops: only update if value differs significantly from stored value
        // Use a small epsilon for float comparison
        const currentChanged = Math.abs(calculatedCurrent - campaignInfo.current) > 0.05;
        const countChanged = newCompletedCount !== (campaignInfo.completedCount || 0) || newRegisteredCount !== (campaignInfo.registeredCount || 0);

        if (currentChanged || countChanged || true) { // Always sync if loaded
            const calculatedProgress = campaignInfo.target > 0
                ? Math.min((calculatedCurrent / campaignInfo.target) * 100, 100)
                : 0;

            console.log(`Syncing Campaign ${campaignInfo.id}: Volume ${calculatedCurrent}, Donors ${newCompletedCount}/${newRegisteredCount}`);

            updateCampaign({
                ...campaignInfo,
                current: parseFloat(calculatedCurrent.toFixed(2)),
                progress: parseFloat(calculatedProgress.toFixed(1)),
                completedCount: newCompletedCount,
                registeredCount: newRegisteredCount,
                appointments: appointments // Persist the modified appointments
            });
        }
    }, [appointments, campaignInfo.id, campaignInfo.target, campaignInfo.current, campaignInfo.completedCount, campaignInfo.registeredCount, isLoaded]);

    useEffect(() => { setCurrentPage(1); }, [statusFilter]);

    const handleDonatedChange = (id: number, value: string) => {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, donated: value === '' ? undefined : parseFloat(value) } : a));
    };
    const handleConfirm = (id: number) => {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "Hoàn thành", statusClass: "px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded" } : a));
    };
    const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    const handleEditClick = () => {
        setEditForm({
            ...campaignInfo,
            bloodTypes: campaignInfo.bloodTypes || ["O+"]
        });
        setIsEditModalOpen(true);
    };

    const getBloodClass = (type: string) => {
        if (type.includes('O')) return "text-red-600 bg-red-50 dark:bg-red-900/20";
        if (type.includes('B')) return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
        if (type.includes('A')) return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"; // Covers A and AB
        return "text-slate-600 bg-slate-100 dark:bg-slate-800";
    };

    const calculateTimeLeft = (dateStr: string, endTimeStr?: string) => {
        try {
            // value "12/10 - 15/10/2024" or "20/10/2024"
            let targetDateStr = dateStr;
            if (dateStr.includes("-")) {
                const parts = dateStr.split("-");
                targetDateStr = parts[parts.length - 1].trim(); // Get the end date
            }

            // Parse DD/MM/YYYY
            const [day, month, year] = targetDateStr.split('/').map(Number);

            const targetDate = new Date(year, month - 1, day);

            if (endTimeStr) {
                const [hours, minutes] = endTimeStr.split(':').map(Number);
                targetDate.setHours(hours, minutes, 0, 0);
            } else {
                targetDate.setHours(23, 59, 59, 999); // End of day default
            }

            const now = new Date();
            const diffMs = targetDate.getTime() - now.getTime();

            if (diffMs <= 0) return "Đã kết thúc";

            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            if (diffDays > 0) return `${diffDays} ngày nữa`;
            if (diffHours > 0) return `${diffHours} giờ nữa`;
            return "Sắp hết hạn";
        } catch (e) {
            return "Không xác định";
        }
    };

    const handleSaveCampaign = () => {
        const selectedBloodType = editForm.bloodTypes && editForm.bloodTypes.length > 0 ? editForm.bloodTypes[0] : (editForm.bloodType || "O+");

        // Recalculate time left
        const newTimeLeft = calculateTimeLeft(editForm.date || "", editForm.endTime);

        const updated = {
            ...editForm,
            bloodType: selectedBloodType,
            bloodClass: getBloodClass(selectedBloodType),
            // Ensure operationalStatus is updated from the select input
            operationalStatus: editForm.operationalStatus,
            timeLeft: newTimeLeft
        };
        setCampaignInfo(updated);
        updateCampaign(updated);
        setIsEditModalOpen(false);
    };

    const handleEndCampaign = () => {
        setIsEndModalOpen(true);
    };

    const confirmEndCampaign = () => {
        const updated = {
            ...campaignInfo,
            operationalStatus: "Đã kết thúc",
            timeLeft: "Đã kết thúc",
            current: totalCollected // Ensure final current is accurate
        };
        setCampaignInfo(updated);
        updateCampaign(updated);
        setIsEndModalOpen(false);
        setIsEditModalOpen(false);
    };

    const toggleBloodType = (type: string) => {
        setEditForm(prev => {
            const currentTypes = prev.bloodTypes || [];
            const exists = currentTypes.includes(type);
            if (exists) {
                return { ...prev, bloodTypes: currentTypes.filter(t => t !== type) };
            } else {
                return { ...prev, bloodTypes: [...currentTypes, type] };
            }
        });
    };

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            <style jsx global>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .metric-card {
                    background: linear-gradient(to bottom right, white, #f8fafc);
                    border: 1px solid #e2e8f0;
                    border-radius: 1.5rem;
                    padding: 2.5rem;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .metric-card:hover {
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                    transform: translateY(-2px);
                }
                .dark .metric-card {
                    background: linear-gradient(to bottom right, #0f172a, #1e293b);
                    border-color: #334155;
                }
            `}</style>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Chỉnh sửa Chiến dịch</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tên chiến dịch</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#137fec] outline-none"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Thời gian (Ngày)</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#137fec] outline-none"
                                        value={editForm.date}
                                        onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                        placeholder="VD: 20/10/2024"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Giờ bắt đầu - Kết thúc</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="w-1/2 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#137fec] outline-none"
                                            value={editForm.startTime || ''}
                                            onChange={e => setEditForm({ ...editForm, startTime: e.target.value })}
                                            onFocus={(e) => (e.target.type = "time")}
                                            onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                                            placeholder="07:30"
                                        />
                                        <span className="self-center">-</span>
                                        <input
                                            type="text"
                                            className="w-1/2 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#137fec] outline-none"
                                            value={editForm.endTime || ''}
                                            onChange={e => setEditForm({ ...editForm, endTime: e.target.value })}
                                            onFocus={(e) => (e.target.type = "time")}
                                            onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                                            placeholder="16:30"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Địa điểm</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#137fec] outline-none"
                                        value={editForm.location}
                                        onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Blood Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Yêu cầu về Máu</label>
                                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                    {bloodTypeOptions.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => toggleBloodType(type)}
                                            className={`px-2 py-2 rounded-lg text-sm font-bold border transition-all
                                                ${(editForm.bloodTypes || []).includes(type)
                                                    ? 'bg-[#6d28d9] text-white border-[#6d28d9] shadow-md shadow-purple-500/30'
                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#6d28d9] hover:text-[#6d28d9]'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mục tiêu (Lít)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#137fec] outline-none"
                                        value={editForm.target}
                                        onChange={e => setEditForm({ ...editForm, target: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Trạng thái HĐ</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#137fec] outline-none"
                                        value={editForm.operationalStatus || "Đang hoạt động"}
                                        onChange={e => setEditForm({ ...editForm, operationalStatus: e.target.value })}
                                    >
                                        <option value="Đang hoạt động">Đang hoạt động</option>
                                        <option value="Tạm dừng">Tạm dừng</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <button
                                onClick={handleEndCampaign}
                                className="px-4 py-2 bg-white dark:bg-slate-800 text-red-600 border border-red-200 dark:border-red-900/50 font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Kết thúc chiến dịch
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleSaveCampaign}
                                    className="px-4 py-2 bg-[#137fec] text-white font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* End Confirmation Modal */}
            {isEndModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Xác nhận kết thúc chiến dịch?</h3>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-100 dark:border-slate-800">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Thống kê hiện tại</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Đã thu thập:</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{totalCollected.toFixed(2)} đơn vị</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Mục tiêu:</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{campaignInfo.target} đơn vị</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 bg-[#137fec]"
                                            style={{ width: `${Math.min(((totalCollected || 0) / (campaignInfo.target || 1)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-3 rounded-lg text-sm font-medium mb-4 flex items-start gap-2 ${(campaignInfo.current || 0) >= campaignInfo.target
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                }`}>
                                <span className="material-symbols-outlined text-[18px] translate-y-0.5">
                                    {(campaignInfo.current || 0) >= campaignInfo.target ? 'check_circle' : 'warning'}
                                </span>
                                <div>
                                    {(campaignInfo.current || 0) >= campaignInfo.target
                                        ? `Đã đạt đủ mục tiêu! (Dư ${((campaignInfo.current || 0) - campaignInfo.target).toFixed(2)} đơn vị)`
                                        : `Còn thiếu ${(campaignInfo.target - (campaignInfo.current || 0)).toFixed(2)} đơn vị để đạt mục tiêu.`
                                    }
                                    <div className="mt-1 font-normal opacity-90">
                                        Bạn có thể tìm thêm nguồn máu ở các chiến dịch khác.
                                    </div>
                                </div>
                            </div>

                            <div className="text-sm text-slate-500 mb-2">
                                Hành động này sẽ dừng mọi hoạt động của chiến dịch và chuyển vào lịch sử.
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setIsEndModalOpen(false)}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmEndCampaign}
                                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                            >
                                Đồng ý kết thúc
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f7f8] dark:bg-[#161121] font-sans text-slate-900 dark:text-white">
                <div className="flex h-full grow flex-row">
                    <HospitalSidebar />
                    <div className="flex-1 flex flex-col min-w-0">
                        <TopNav title="Chi tiết & Phân tích Chiến dịch" />

                        <main className="flex-1 p-12 max-w-[1800px] w-full mx-auto">
                            {/* Campaign Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <Link href="/hospital/campaign" className="text-slate-400 hover:text-[#137fec] transition-colors">
                                            <span className="material-symbols-outlined">arrow_back</span>
                                        </Link>
                                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{campaignInfo.name}</h1>
                                        <div className="flex gap-2">
                                            {/* Priority/Badge Tag (e.g. Khẩn cấp) */}
                                            {campaignInfo.status && (
                                                <span className={`px-2.5 py-1 ${campaignInfo.statusClass.startsWith('bg-') ? campaignInfo.statusClass : 'bg-slate-100 text-slate-700'} text-xs font-bold rounded-full flex items-center gap-1`}>
                                                    <span className={`size-2 bg-current rounded-full opacity-70`}></span> {campaignInfo.status}
                                                </span>
                                            )}

                                            {/* Operational Status Tag */}
                                            <span className={`px-2.5 py-1 ${campaignInfo.operationalStatus === 'Đang hoạt động' ? 'bg-green-100 text-green-700' : campaignInfo.operationalStatus === 'Tạm dừng' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'} text-xs font-bold rounded-full flex items-center gap-1`}>
                                                <span className={`size-2 ${campaignInfo.operationalStatus === 'Đang hoạt động' ? 'bg-green-500' : campaignInfo.operationalStatus === 'Tạm dừng' ? 'bg-amber-500' : 'bg-slate-500'} rounded-full`}></span> {campaignInfo.operationalStatus || "Đang hoạt động"}
                                            </span>

                                            {(campaignInfo.bloodTypes || []).length > 0 && (
                                                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">bloodtype</span>
                                                    {(campaignInfo.bloodTypes || []).join(', ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">calendar_month</span> {campaignInfo.startTime && campaignInfo.endTime ? `${campaignInfo.startTime} - ${campaignInfo.endTime} • ` : ''}{campaignInfo.date}</span>
                                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">location_on</span> {campaignInfo.location}</span>
                                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">group</span> {campaignInfo.staffCount} Nhân viên</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        onClick={handleEditClick}
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <span className="material-symbols-outlined">share</span>
                                    </button>
                                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-sm">
                                        <span className="material-symbols-outlined text-[18px]">table_view</span>
                                        Xuất Excel
                                    </button>
                                </div>
                            </div>

                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
                                {/* Goal Progress */}
                                <div className="metric-card lg:col-span-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tiến độ Mục tiêu</h3>
                                        <span className="material-symbols-outlined text-[#137fec]">analytics</span>
                                    </div>
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-3xl font-black">{totalCollected.toFixed(2)}</span>
                                        <span className="text-slate-400 font-medium mb-1">/ {targetVolume} Lít</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-2">
                                        <div className="bg-[#137fec] h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-[#137fec] font-bold">{progressPercent.toFixed(1)}% Đã thu thập</span>
                                        <span className="text-slate-500">Còn {remaining.toFixed(2)} Lít</span>
                                    </div>
                                </div>

                                {/* Donor Registration */}
                                <div className="metric-card lg:col-span-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Đăng ký Người hiến</h3>
                                        <span className="material-symbols-outlined text-orange-500">person_add</span>
                                    </div>
                                    <div className="flex items-end gap-2 mb-4">
                                        <span className="text-3xl font-black">{totalRegistered}</span>
                                        <span className="text-slate-400 font-medium mb-1">Người đã đăng ký</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            <div className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAga-rqFcLFiRRDhbU4kEnkXa6VuhqCEjigSqCid55R11mBoiYdw9Bdk01ekhpIKn-00SDKKBd-mQLKbAcwMMLz_BR5Vj18xY3siCP8JxhiBypqWtIjTGpXghKUO4OeUpYumG7mSXB4THGjLsO6-wKYsWf7A1488ror3IOs55v3i8zKIFvoDaFTKkLCK7Ms_0wt3QCDlLcUzlsotKeIznIbzwJFpbpPbvVqFtlbjldRKTwWMpzyhnGDKKGoYOvkA_TyZzP_yeqmOCU4')" }}></div>
                                            <div className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuClv-130taYt_YkMzdYfG2NgDtC1JIygKSOn8wCVwi8X5VZ4L2CV3dAXqeYEQ-233Kj-quReUT9UZNGc9EWrlByO7DeNGNMYzQ9Oy04iKDEVJMp6CYcEifXXKvt_L2JaaLn39_FR5PODpUOaoMAl_grhN7mpW21nvN26SizpkQQXRr7lX_b488Nvc2O9KSaLSsiZW-ulEXrTnr_Gf_scNWO5Nvqfd4aZqdo7ZGRQJmV5BNBdRWTX6D-zpJM4dCM25mvUA3i2Paf4-2G')" }}></div>
                                            <div className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMLdY2S9pIbL2fKGFAg1tvjvG7iS4OTZy02xeMXtql4KA7CfSlp9Ya2yJ_TwsOIVf4WjHsI6ejL2xOIT4PMRLrLKoDkq2vJG8ccT6MAXyC6zH0-JeSPc1kwfHfVAwoY2hucQ-MwugbMBs6lvC81jwxE2lg5DUV4Cv9gTzxN8vY8bpSmZDrfc5cQRbvJmKXZRbXuISvSIE8TkqFWHFLQXznS_RNPAbVlb7ToOGvpROq1JXFBHzmm6RnmOJAZ-2zJabFs4CjPeR24gO2')" }}></div>
                                            <div className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-[#137fec] flex items-center justify-center text-[10px] text-white font-bold">+{totalRegistered > 3 ? totalRegistered - 3 : 0}</div>
                                        </div>
                                        <span className="text-xs text-slate-500">Đăng ký gần nhất 5p trước</span>
                                    </div>
                                </div>

                                {/* Actual Analysis (Was Estimated Yield) */}
                                <div className="metric-card lg:col-span-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Phân tích Thực tế</h3>
                                        <span className="material-symbols-outlined text-emerald-500">show_chart</span>
                                    </div>
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-3xl font-black">{totalCollected.toFixed(2)}</span>
                                        <span className="text-slate-400 font-medium mb-1">Lít (Thực tế)</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-xs text-slate-500">
                                        <div className="flex justify-between">
                                            <span>Thiếu hụt:</span>
                                            <span className="font-bold text-red-500">{deficit.toFixed(2)} Lít</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span>Đánh giá:</span>
                                            <span className={`font-bold flex items-center gap-1 ${analysisColor}`}>
                                                <span className="material-symbols-outlined text-sm">{analysisIcon}</span> {analysisAssessment}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Campaign Detailed Description */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-10 mb-12 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#137fec]">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mô tả Chi tiết Chiến dịch</h2>
                                </div>
                                <div
                                    className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed font-medium"
                                    dangerouslySetInnerHTML={{ __html: campaignInfo.desc || '<p class="italic opacity-50">Không có mô tả chi tiết cho chiến dịch này.</p>' }}
                                />
                            </div>

                            {/* Appointment Schedule Table */}
                            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
                                <div className="p-10 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h2 className="text-lg font-bold">Lịch hẹn Hiến máu</h2>
                                        <p className="text-sm text-slate-500">Theo dõi check-in và phân bổ nhóm máu.</p>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <label className="relative flex items-center">
                                            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[20px]">search</span>
                                            <input className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-[#137fec]/50 outline-none" placeholder="Tìm kiếm người hiến..." type="text" />
                                        </label>
                                        <select
                                            className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-[#137fec]/50 outline-none"
                                            value={statusFilter}
                                            onChange={e => setStatusFilter(e.target.value)}
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tên Người hiến</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Nhóm máu</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Giờ hẹn</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Đơn vị máu hiến</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {paginatedAppointments.map(a => (
                                                <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#137fec] text-xs">{a.code}</div>
                                                            <div>
                                                                <div className="text-sm font-bold text-slate-900 dark:text-white">{a.name}</div>
                                                                <div className="text-[11px] text-slate-500">{a.type}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={a.bloodClass}>{a.blood}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{a.time}</td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            step="any"
                                                            className="w-24 px-2 py-1 border rounded text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                            value={a.donated === undefined ? '' : a.donated}
                                                            onChange={e => handleDonatedChange(a.id, e.target.value)}
                                                            placeholder="ml"
                                                            disabled={a.status === "Hoàn thành" || isEnded}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={a.statusClass}>{a.status}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {!isEnded && a.status !== "Hoàn thành" ? (
                                                                <button
                                                                    className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 transition-all min-w-[140px] text-center"
                                                                    style={{ margin: 0 }}
                                                                    onClick={() => handleConfirm(a.id)}
                                                                >
                                                                    Xác nhận hoàn thành
                                                                </button>
                                                            ) : isEnded && a.status !== "Hoàn thành" ? (
                                                                <span className="text-xs text-slate-400 font-medium italic min-w-[140px] text-center">Không khả dụng</span>
                                                            ) : (
                                                                <div className="min-w-[140px]"></div>
                                                            )}
                                                            {!isEnded && (
                                                                <button className="text-[#137fec] hover:text-[#137fec]/80 transition-colors static">
                                                                    <span className="material-symbols-outlined">more_vert</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-medium">
                                        Hiển thị {filteredAppointments.length === 0 ? 0 : ((currentPage - 1) * pageSize + 1)} đến {Math.min(currentPage * pageSize, filteredAppointments.length)} trong tổng số {filteredAppointments.length} lịch hẹn
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50"
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                        </button>
                                        <button
                                            className="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50"
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages || totalPages === 0}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </main>

                        <MiniFooter />
                    </div>
                </div>
            </div >
        </>
    );
}
