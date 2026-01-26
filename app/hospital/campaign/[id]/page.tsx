"use client";

import React, { useState, useEffect } from 'react';
import { HospitalSidebar } from "@/components/HospitalSidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getCampaignById, updateCampaign, Campaign, getCampaigns, Appointment } from "@/app/utils/campaignStorage";
import { addSupportRequest } from "@/app/utils/supportStorage";


const DEFAULT_APPOINTMENTS = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        type: "Người hiến thường xuyên",
        code: "NV",
        blood: "O+ (O DƯƠNG)",
        bloodClass: "px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded border border-indigo-100 uppercase",
        time: "10:30",
        status: "Hoàn thành",
        statusClass: "px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded",
        donated: 450
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
        bloodClass: "px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded border border-indigo-100 uppercase",
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
        status: "Hoãn hiến",
        statusClass: "px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded border border-indigo-100",
        donated: 0
    },
    {
        id: 5,
        name: "Trần Văn D",
        type: "Người hiến mới",
        code: "TD",
        blood: "O+ (O DƯƠNG)",
        bloodClass: "px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded border border-indigo-100 uppercase",
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
        status: "Đang chờ",
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
        donated: 350
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
        bloodClass: "px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded border border-indigo-100 uppercase",
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
        status: "Đang chờ",
        statusClass: "px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded",
        donated: undefined
    },
];

export default function CampaignDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromTab = searchParams.get('fromTab') || 'active';
    const rawId = Number(params.id);

    // Helper to push notifications to TopNav
    const pushNotification = (data: { title: string; desc: string; type: string; color?: string; bg?: string }) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('redhope:notification', { detail: data }));
        }
    };

    // Validate ID
    if (isNaN(rawId) || rawId <= 0) {
        if (typeof window !== 'undefined') {
            router.replace('/hospital/campaign');
        }
        return null;
    }
    const id = rawId;

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
        target: 50000, // ml
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
            // Load stored appointments and migrate "Đã đặt lịch" to "Đang chờ"
            const rawAppointments = (stored.appointments && stored.appointments.length > 0)
                ? stored.appointments
                : DEFAULT_APPOINTMENTS;

            const migratedApps = rawAppointments.map(a =>
                a.status === "Đã đặt lịch" || a.status === "Đã hủy" ? { ...a, status: "Đang chờ" } : a
            );
            setAppointments(migratedApps);

            // Detect if migration is needed to avoid redundant writes
            const migrationNeeded = JSON.stringify(rawAppointments) !== JSON.stringify(migratedApps);

            if (migrationNeeded) {
                // If automatic persist is required, gate the call
                updateCampaign({
                    ...stored,
                    appointments: migratedApps
                });
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
    const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [supportType, setSupportType] = useState<"doctor" | "staff" | "supply" | "emergency">("staff");
    const [supportMessage, setSupportMessage] = useState("");

    const handleTimeManualChange = (field: 'startTime' | 'endTime', value: string) => {
        let val = value.replace(/\D/g, '');
        if (val.length >= 3) {
            val = val.slice(0, 2) + ':' + val.slice(2, 4);
        }
        val = val.slice(0, 5);
        setEditForm(prev => ({ ...prev, [field]: val }));
    };

    // Handle click outside dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdown = document.getElementById('status-dropdown-container');
            if (dropdown && !dropdown.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            window.addEventListener('click', handleClickOutside);
        } else {
            window.removeEventListener('click', handleClickOutside);
        }

        return () => window.removeEventListener('click', handleClickOutside);
    }, [isDropdownOpen]);
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
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 4;
    const statusOptions = ["Tất cả", "Đang chờ", "Đang tiến hành", "Hoàn thành", "Hoãn hiến"];

    // Apply filters and search
    const filteredByStatus = statusFilter === "Tất cả"
        ? appointments
        : appointments.filter(a => a.status === statusFilter);

    const filteredBySearch = searchTerm.trim() === ""
        ? filteredByStatus
        : filteredByStatus.filter(a =>
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.code.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const sortedAppointments = [...filteredBySearch].sort((a, b) =>
        a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
    );

    const totalPages = Math.ceil(sortedAppointments.length / pageSize);
    const paginatedAppointments = sortedAppointments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
    // So I will change the display to "X / 50000 ml" (ml) to be consistent with "lượng máu".
    const progressPercent = Math.min((totalCollected / (targetVolume || 1)) * 100, 100);
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
        const deferredApps = appointments.filter(a => a.status === "Đã hoãn" || a.status === "Hoãn hiến");
        const calculatedCurrent = completedApps.reduce((sum, a) => sum + (a.donated || 0), 0);
        const newCompletedCount = completedApps.length;
        const newDeferredCount = deferredApps.length;
        const newRegisteredCount = appointments.length;

        const currentChanged = Math.abs(calculatedCurrent - campaignInfo.current) > 1;
        const countChanged =
            newCompletedCount !== (campaignInfo.completedCount || 0) ||
            newDeferredCount !== (campaignInfo.deferredCount || 0) ||
            newRegisteredCount !== (campaignInfo.registeredCount || 0);

        if (isLoaded && (currentChanged || countChanged)) {
            const calculatedProgress = campaignInfo.target > 0
                ? Math.min((calculatedCurrent / campaignInfo.target) * 100, 100)
                : 0;

            console.log(`Syncing Campaign ${campaignInfo.id}: Volume ${calculatedCurrent}, Donors ${newCompletedCount}/${newRegisteredCount}`);

            updateCampaign({
                ...campaignInfo,
                current: parseFloat(calculatedCurrent.toFixed(2)),
                progress: parseFloat(calculatedProgress.toFixed(1)),
                completedCount: newCompletedCount,
                deferredCount: newDeferredCount,
                registeredCount: newRegisteredCount,
                appointments: appointments // Persist the modified appointments
            });

            // Trigger "Goal Reached" Notification
            if (calculatedCurrent >= campaignInfo.target && campaignInfo.target > 0) {
                const alreadyNotified = localStorage.getItem(`goal_notified_${campaignInfo.id}`);
                if (!alreadyNotified) {
                    pushNotification({
                        title: "✅ Tin mừng: Đạt chỉ tiêu",
                        desc: `Tuyệt vời! Chiến dịch '${campaignInfo.name}' đã thu được ${Math.round(calculatedProgress)}% chỉ tiêu. Bạn có muốn đóng đăng ký sớm không?`,
                        type: "check",
                        color: "text-emerald-500",
                        bg: "bg-emerald-50"
                    });
                    localStorage.setItem(`goal_notified_${campaignInfo.id}`, 'true');
                }
            }
        }
    }, [appointments, campaignInfo.id, campaignInfo.target, campaignInfo.current, campaignInfo.completedCount, campaignInfo.registeredCount, isLoaded]);

    // Simulated Operational Alerts for Demo
    useEffect(() => {
        if (isLoaded && campaignInfo.id === 1) { // Only for the main demo campaign
            const timer = setTimeout(() => {
                // Scenario: Overload Warning
                pushNotification({
                    title: "⚠️ Cảnh báo Nguy cơ Quá tải",
                    desc: "Dự báo nóng: Khung giờ 08:00 - 09:00 sáng mai có 150 người đăng ký. Vui lòng tăng cường nhân viên y tế.",
                    type: "alert",
                    color: "text-indigo-600",
                    bg: "bg-indigo-50"
                });

                // Scenario: Negative Feedback
                setTimeout(() => {
                    pushNotification({
                        title: "⭐ Phản hồi Tiêu cực",
                        desc: "Cảnh báo chất lượng: Có 5 người hiến vừa đánh giá 1 sao vì 'Chờ đợi quá lâu' tại điểm hiến này.",
                        type: "feedback",
                        color: "text-amber-500",
                        bg: "bg-amber-50"
                    });
                }, 5000);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, campaignInfo.id]);

    useEffect(() => { setCurrentPage(1); }, [statusFilter, searchTerm]);

    const handleDonatedChange = (id: number, volume: number) => {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, donated: volume } : a));
    };
    const handleDefer = (id: number) => {
        setAppointments(prev => prev.map(a => a.id === id ? {
            ...a,
            status: "Hoãn hiến",
            donated: 0,
            statusClass: "px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded border border-indigo-100"
        } : a));
    };
    const handleConfirm = (id: number) => {
        setAppointments(prev => {
            const appointment = prev.find(a => a.id === id);
            // Default to 350ml if not set
            const donatedVolume = appointment?.donated || 350;
            return prev.map(a => a.id === id ? {
                ...a,
                donated: donatedVolume,
                status: "Hoàn thành",
                statusClass: "px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded"
            } : a);
        });
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
        if (type.includes('O')) return "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20";
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

    const handleSendSupport = () => {
        if (!supportMessage.trim()) {
            alert("Vui lòng nhập mô tả vấn đề!");
            return;
        }
        addSupportRequest({
            campaignId: campaignInfo.id,
            campaignName: campaignInfo.name,
            type: supportType,
            message: supportMessage,
            timestamp: new Date().toISOString(),
            status: "pending"
        });
        setIsSupportModalOpen(false);
        setSupportMessage("");
        setSupportType("staff");
        alert("Đã gửi yêu cầu hỗ trợ đến trung tâm điều phối!");
    };

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            <style jsx global>{`
                :root {
                    --primary: #6324eb;
                    --primary-light: #4c11ce;
                    --primary-soft: #eef2ff;
                    --accent-purple: #818cf8;
                }
                .font-sans {
                    font-family: 'Plus Jakarta Sans', sans-serif !important;
                }
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .metric-card {
                    background: white;
                    border: 1px solid #F1F5F9;
                    border-radius: 1.5rem;
                    padding: 1rem;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .metric-card:hover {
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
                    transform: translateY(-2px);
                }
                .pill-input {
                    width: 100%;
                    height: 3.5rem;
                    border-radius: 9999px;
                    border: 1px solid #E2E8F0;
                    background-color: rgba(255, 255, 255, 0.8);
                    font-size: 0.875rem;
                    padding: 0 1.5rem;
                    transition: all 0.3s;
                    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
                    outline: none;
                }
                .pill-input:focus {
                    border-color: rgba(109, 40, 217, 0.4);
                    box-shadow: 0 0 0 4px rgba(109, 40, 217, 0.05);
                }
                /* Hide number input spin buttons */
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
                .blood-group-pill {
                    display: flex;
                    height: 2.5rem;
                    width: 100%;
                    align-items: center;
                    justify-content: center;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    transition: all 0.3s;
                    border: 1px solid;
                }
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    z-index: 50;
                }
                .dark .metric-card {
                    background: #1e293b;
                    border-color: #334155;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                }
            `}</style>

            {/* Edit Modal - Redesigned based on mockup */}
            {isEditModalOpen && (
                <div className="modal-overlay animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-[850px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-[#F5F3FF] dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-[#6D28D9]">
                                    <span className="material-symbols-outlined text-[24px]">edit_calendar</span>
                                </div>
                                <div>
                                    <h2 className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight">Chỉnh sửa Chiến dịch</h2>
                                    <p className="text-slate-400 text-[12px] font-medium">Cập nhật thông tin yêu cầu hiến máu</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="size-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-10 pr-12 py-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="col-span-2 flex flex-col gap-2">
                                        <label className="text-slate-700 dark:text-slate-300 text-[13px] font-bold ml-1">Tên chiến dịch</label>
                                        <input
                                            className="pill-input dark:bg-slate-800 dark:border-slate-700 font-bold px-8"
                                            type="text"
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-700 dark:text-slate-300 text-[13px] font-bold ml-1">Ngày tổ chức</label>
                                        <div className="relative group">
                                            <input
                                                className="pill-input !pl-14 dark:bg-slate-800 dark:border-slate-700 font-bold"
                                                type="text"
                                                value={editForm.date}
                                                onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                            />
                                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#6D28D9] text-[20px]">calendar_month</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-700 dark:text-slate-300 text-[13px] font-bold ml-1">Địa điểm</label>
                                        <div className="relative group">
                                            <input
                                                className="pill-input !pl-14 dark:bg-slate-800 dark:border-slate-700 font-bold"
                                                type="text"
                                                value={editForm.location}
                                                onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                            />
                                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#6D28D9] text-[20px]">location_on</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-slate-700 dark:text-slate-300 text-[13px] font-bold ml-1">Giờ bắt đầu</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={editForm.startTime || ""}
                                                    onFocus={() => setIsStartTimeOpen(true)}
                                                    onChange={(e) => handleTimeManualChange('startTime', e.target.value)}
                                                    maxLength={5}
                                                    placeholder="HH:mm"
                                                    className="pill-input !flex items-center !pl-14 !pr-10 dark:bg-slate-800 dark:border-slate-700 font-bold hover:border-[#6D28D9]/50 transition-all shadow-sm"
                                                />
                                                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#6D28D9] text-[20px] font-black pointer-events-none">schedule</span>
                                                <span
                                                    className={`material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-transform duration-300 pointer-events-none ${isStartTimeOpen ? 'rotate-180' : ''}`}
                                                >
                                                    expand_more
                                                </span>

                                                {isStartTimeOpen && (
                                                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] py-2 max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                                                        <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 mb-1">Gợi ý mốc giờ</div>
                                                        {Array.from({ length: 33 }).map((_, i) => {
                                                            const hour = Math.floor(i / 2) + 6;
                                                            const min = i % 2 === 0 ? "00" : "30";
                                                            const t = `${hour.toString().padStart(2, '0')}:${min}`;
                                                            return (
                                                                <button
                                                                    key={t}
                                                                    onClick={() => { setEditForm({ ...editForm, startTime: t }); setIsStartTimeOpen(false); }}
                                                                    className={`w-full flex items-center justify-between px-5 py-2.5 text-xs font-bold transition-all ${editForm.startTime === t ? 'text-[#6D28D9] bg-purple-50 dark:bg-purple-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                                >
                                                                    <span>{t}</span>
                                                                    {editForm.startTime === t && <span className="material-symbols-outlined text-[14px]">check</span>}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-slate-700 dark:text-slate-300 text-[13px] font-bold ml-1">Giờ kết thúc</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={editForm.endTime || ""}
                                                    onFocus={() => setIsEndTimeOpen(true)}
                                                    onChange={(e) => handleTimeManualChange('endTime', e.target.value)}
                                                    maxLength={5}
                                                    placeholder="HH:mm"
                                                    className="pill-input !flex items-center !pl-14 !pr-10 dark:bg-slate-800 dark:border-slate-700 font-bold hover:border-[#6D28D9]/50 transition-all shadow-sm"
                                                />
                                                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#6D28D9] text-[20px] font-black pointer-events-none">more_time</span>
                                                <span
                                                    className={`material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-transform duration-300 pointer-events-none ${isEndTimeOpen ? 'rotate-180' : ''}`}
                                                >
                                                    expand_more
                                                </span>

                                                {isEndTimeOpen && (
                                                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] py-2 max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                                                        <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 mb-1">Gợi ý mốc giờ</div>
                                                        {Array.from({ length: 33 }).map((_, i) => {
                                                            const hour = Math.floor(i / 2) + 6;
                                                            const min = i % 2 === 0 ? "00" : "30";
                                                            const t = `${hour.toString().padStart(2, '0')}:${min}`;
                                                            return (
                                                                <button
                                                                    key={t}
                                                                    onClick={() => { setEditForm({ ...editForm, endTime: t }); setIsEndTimeOpen(false); }}
                                                                    className={`w-full flex items-center justify-between px-5 py-2.5 text-xs font-bold transition-all ${editForm.endTime === t ? 'text-[#6D28D9] bg-purple-50 dark:bg-purple-900/20' : 'text-slate-600 dark:text-slate-400'}`}
                                                                >
                                                                    <span>{t}</span>
                                                                    {editForm.endTime === t && <span className="material-symbols-outlined text-[14px]">check</span>}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Image Edit Section */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 dark:text-slate-300 text-[13px] font-bold ml-1">Hình ảnh chiến dịch</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            id="edit-modal-image"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setEditForm({ ...editForm, image: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="edit-modal-image"
                                            className={`relative w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${editForm.image ? 'border-transparent' : 'border-slate-200 hover:border-[#6D28D9] bg-slate-50 hover:bg-white'}`}
                                        >
                                            {editForm.image ? (
                                                <>
                                                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${editForm.image}')` }}></div>
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-lg">
                                                            <span className="material-symbols-outlined text-[16px]">edit</span> Thay đổi
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                                    <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Tải ảnh lên</span>
                                                </div>
                                            )}
                                        </label>
                                        {editForm.image && (
                                            <button
                                                onClick={() => setEditForm({ ...editForm, image: "" })}
                                                className="size-10 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-100 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all shrink-0"
                                                title="Xóa ảnh"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="flex flex-col gap-3">
                                    <label className="text-slate-700 dark:text-slate-300 text-[13px] font-bold ml-1">Yêu cầu về Máu</label>
                                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                        {bloodTypeOptions.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => toggleBloodType(type)}
                                                className={`blood-group-pill transition-all duration-300 ${(editForm.bloodTypes || []).includes(type)
                                                    ? 'bg-[#6D28D9] text-white border-[#6D28D9] shadow-lg shadow-purple-500/20 scale-105'
                                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-700 dark:text-slate-300 text-[13px] font-bold ml-1">Mục tiêu (ml)</label>
                                        <div className="relative">
                                            <input
                                                className="pill-input dark:bg-slate-800 dark:border-slate-700 pr-12 font-bold"
                                                type="number"
                                                value={editForm.target}
                                                onChange={e => setEditForm({ ...editForm, target: Number(e.target.value) })}
                                            />
                                            <span className="absolute right-7 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest pointer-events-none">ML</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-700 dark:text-slate-300 text-[13px] font-bold ml-1">Trạng thái vận hành</label>
                                        <div className="relative">
                                            <select
                                                className="pill-input appearance-none dark:bg-slate-800 dark:border-slate-700 pr-12 font-bold cursor-pointer"
                                                value={editForm.operationalStatus || "Đang hoạt động"}
                                                onChange={e => setEditForm({ ...editForm, operationalStatus: e.target.value })}
                                            >
                                                <option value="Đang hoạt động">Đang hoạt động</option>
                                                <option value="Tạm dừng">Tạm dừng</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                            <button
                                onClick={handleEndCampaign}
                                className="px-6 h-12 rounded-full border-2 border-rose-500 text-rose-500 text-sm font-extrabold hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                            >
                                Kết thúc chiến dịch
                            </button>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-6 h-12 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleSaveCampaign}
                                    className="px-8 h-12 bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white rounded-full text-sm font-extrabold shadow-[0_10px_15px_-3px_rgba(109,40,217,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* End Confirmation Modal */}
            {isSupportModalOpen && (
                <div className="modal-overlay animate-in fade-in duration-200" style={{ zIndex: 60 }}>
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-[600px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-red-50/30 dark:bg-red-900/10">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600">
                                    <span className="material-symbols-outlined text-[24px]">medical_services</span>
                                </div>
                                <div>
                                    <h2 className="text-red-600 dark:text-red-400 text-xl font-extrabold tracking-tight">Yêu cầu Hỗ trợ</h2>
                                    <p className="text-slate-400 text-[12px] font-medium">Gửi yêu cầu chi viện khẩn cấp đến trung tâm</p>
                                </div>
                            </div>
                            <button onClick={() => setIsSupportModalOpen(false)} className="size-8 rounded-full hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Loại hỗ trợ</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'staff', label: 'Nhân sự', icon: 'group' },
                                        { id: 'doctor', label: 'Bác sĩ', icon: 'stethoscope' },
                                        { id: 'supply', label: 'Vật tư', icon: 'inventory_2' },
                                        { id: 'emergency', label: 'Khẩn cấp', icon: 'warning' }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSupportType(type.id as any)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 font-bold text-sm transition-all ${supportType === type.id
                                                ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                                : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-red-200 hover:bg-red-50/50'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined">{type.icon}</span>
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Mô tả vấn đề</label>
                                <textarea
                                    className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-red-500 focus:ring-0 outline-none text-sm font-medium resize-none"
                                    placeholder="Nhập chi tiết vấn đề cần hỗ trợ..."
                                    value={supportMessage}
                                    onChange={(e) => setSupportMessage(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setIsSupportModalOpen(false)}
                                    className="flex-1 py-3.5 rounded-full font-bold text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleSendSupport}
                                    className="flex-1 py-3.5 rounded-full font-bold text-sm bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">send</span> Gửi yêu cầu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isEndModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Xác nhận kết thúc?</h3>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-6 border border-slate-100 dark:border-slate-800">
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Thống kê cuối cùng</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">Đã thu thập:</span>
                                        <span className="font-extrabold text-slate-900 dark:text-white">{totalCollected.toFixed(0)} ml</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">Mục tiêu:</span>
                                        <span className="font-extrabold text-slate-900 dark:text-white">{campaignInfo.target} ml</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 bg-[#dc2626]"
                                            style={{ width: `${Math.min(((totalCollected || 0) / (campaignInfo.target || 1)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 mb-2 leading-relaxed font-medium">
                                Hành động này sẽ dừng mọi hoạt động và chuyển chiến dịch vào lịch sử báo cáo.
                            </p>
                        </div>
                        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setIsEndModalOpen(false)}
                                className="px-5 h-11 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmEndCampaign}
                                className="px-6 h-11 bg-rose-600 text-white font-extrabold rounded-full hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20"
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
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-4">
                                        <Link href={`/hospital/campaign?tab=${fromTab}`} className="size-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-[#6324eb] hover:bg-white hover:shadow-md transition-all">
                                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                        </Link>
                                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{campaignInfo.name}</h1>
                                        <div className="flex gap-2">
                                            {campaignInfo.isUrgent && (
                                                <span className="px-4 py-1.5 bg-indigo-50 text-[#6324eb] text-[11px] font-extrabold rounded-full flex items-center gap-1.5 border border-indigo-100 animate-pulse">
                                                    <span className="size-1.5 bg-[#6324eb] rounded-full"></span> KHẨN CẤP
                                                </span>
                                            )}
                                            <span className={`px-4 py-1.5 ${campaignInfo.operationalStatus === 'Đang hoạt động' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'} text-[11px] font-extrabold rounded-full flex items-center gap-1.5 border`}>
                                                <span className={`size-1.5 ${campaignInfo.operationalStatus === 'Đang hoạt động' ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full`}></span> {campaignInfo.operationalStatus || "Đang hoạt động"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-400 ml-14">
                                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">calendar_month</span> {campaignInfo.startTime && campaignInfo.endTime ? `${campaignInfo.startTime} - ${campaignInfo.endTime} • ` : ''}{campaignInfo.date}</span>
                                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">location_on</span> {campaignInfo.location}</span>
                                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">group</span> {campaignInfo.staffCount} Nhân viên</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        className="size-12 rounded-full border-2 border-red-50 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 flex items-center justify-center transition-all bg-white dark:bg-slate-900 shadow-sm hover:shadow-red-500/20"
                                        onClick={() => setIsSupportModalOpen(true)}
                                        title="Yêu cầu Chi viện"
                                    >
                                        <span className="material-symbols-outlined text-[24px]">sos</span>
                                    </button>
                                    <button
                                        className="size-12 rounded-full border-2 border-slate-50 dark:border-slate-800 text-slate-400 hover:text-[#6324eb] hover:border-[#6324eb] hover:shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center transition-all bg-white dark:bg-slate-900"
                                        onClick={handleEditClick}
                                    >
                                        <span className="material-symbols-outlined text-[22px]">edit</span>
                                    </button>
                                    <button className="size-12 rounded-full border-2 border-slate-50 dark:border-slate-800 text-slate-400 hover:text-[#6324eb] flex items-center justify-center transition-all bg-white dark:bg-slate-900">
                                        <span className="material-symbols-outlined text-[22px]">share</span>
                                    </button>
                                    <button className="px-8 h-12 bg-[#6324eb] text-white rounded-full text-sm font-extrabold flex items-center gap-3 hover:bg-[#501ac2] hover:shadow-xl hover:shadow-indigo-500/20 transition-all">
                                        <span className="material-symbols-outlined text-[20px]">table_view</span>
                                        Xuất Dữ liệu
                                    </button>
                                </div>
                            </div>

                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                                {/* Goal Progress */}
                                <div className={`metric-card transition-all duration-500 ${progressPercent >= 100 ? 'ring-4 ring-emerald-500/20 border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-500/5' : ''}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`size-8 rounded-lg flex items-center justify-center ${progressPercent >= 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 dark:bg-indigo-900/30 text-[#6324eb]'}`}>
                                            <span className="material-symbols-outlined text-[18px]">{progressPercent >= 100 ? 'celebration' : 'analytics'}</span>
                                        </div>
                                        <span className="text-[9px] font-extrabold text-slate-400/80 uppercase tracking-widest">Tiến độ mục tiêu</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className={`text-2xl font-black tracking-tight ${progressPercent >= 100 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>{totalCollected.toFixed(0)}</span>
                                        <span className="text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">/ {(targetVolume || 0).toLocaleString()} ml</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                                        <div className={`h-full rounded-full transition-all duration-1000 shadow-sm ${progressPercent >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-[#6324eb] to-indigo-400'}`} style={{ width: `${progressPercent}%` }}></div>
                                    </div>
                                    <div className={`flex justify-between items-center p-2 rounded-lg ${progressPercent >= 100 ? 'bg-emerald-500/10' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                        <span className={`${progressPercent >= 100 ? 'text-emerald-600' : 'text-[#6324eb]'} text-[9px] font-bold uppercase tracking-wide`}>
                                            {progressPercent >= 100 ? 'Mục tiêu hoàn thành!' : `${progressPercent.toFixed(1)}% Hoàn thành`}
                                        </span>
                                        <span className={`${progressPercent >= 100 ? 'text-emerald-500' : 'text-slate-400'} text-[9px] font-bold`}>
                                            {progressPercent >= 100 ? 'Vượt chỉ tiêu' : `Còn ${(remaining / 1000).toFixed(1)} Lít nữa`}
                                        </span>
                                    </div>
                                </div>

                                {/* Donor Registration */}
                                <div className="metric-card border-orange-100 dark:border-orange-900/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="size-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                                            <span className="material-symbols-outlined text-[18px]">person_check</span>
                                        </div>
                                        <span className="text-[9px] font-extrabold text-slate-400/80 uppercase tracking-widest">Người hiến thực hiện</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{completedAppointments.length}</span>
                                        <span className="text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">/ {totalRegistered} Đăng ký</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg group transition-all">
                                        <div className="flex -space-x-2">
                                            {completedAppointments.slice(0, 3).map((a, i) => (
                                                <div key={a.id} className="size-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-[8px] text-orange-500 shadow-sm">
                                                    {a.code}
                                                </div>
                                            ))}
                                            {completedAppointments.length > 3 && (
                                                <div className="size-6 rounded-full border-2 border-white dark:border-slate-800 bg-orange-500 flex items-center justify-center text-[8px] text-white font-black">+{completedAppointments.length - 3}</div>
                                            )}
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 tracking-tight">
                                            {completedAppointments.length === totalRegistered ? "Tất cả đã hoàn thành! ✨" : "Đang thực hiện hiến máu"}
                                        </span>
                                    </div>
                                </div>

                                {/* Actual Analysis */}
                                <div className="metric-card">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                                            <span className="material-symbols-outlined text-[18px]">insights</span>
                                        </div>
                                        <span className="text-[9px] font-extrabold text-slate-400/80 uppercase tracking-widest">Phân tích AI</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{totalCollected.toLocaleString()}</span>
                                        <span className="text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">ml thu được</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Trạng thái:</span>
                                            <span className={`text-[9px] font-black uppercase flex items-center gap-1.5 ${analysisColor}`}>
                                                <span className="material-symbols-outlined text-[14px]">{analysisIcon}</span> {analysisAssessment}
                                            </span>
                                        </div>
                                        <div className="h-px bg-slate-100 dark:bg-slate-700 w-full"></div>
                                        <div className="flex justify-between items-center text-[9px] font-bold">
                                            <span className="text-slate-400 uppercase">Thiếu hụt chỉ tiêu:</span>
                                            <span className="text-[#6324eb]">{deficit.toLocaleString()} ml</span>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Appointment Schedule Table */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-none mb-20">
                                <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Lịch hẹn Hiến máu</h2>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Quản lý check-in & Hồ sơ hiến máu</p>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <div className="relative group w-80 sm:w-96">
                                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#6324eb] transition-colors text-[20px] pointer-events-none z-10">search</span>
                                            <input
                                                className="w-full h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-12 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#6324eb]/20 focus:border-[#6324eb] outline-none transition-all shadow-sm dark:text-white"
                                                placeholder="Tìm tên người hiến..."
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative" id="status-dropdown-container">
                                            <button
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="h-11 flex items-center justify-between pl-5 pr-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold shadow-sm cursor-pointer hover:border-[#6324eb]/50 transition-all min-w-[160px]"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span className="material-symbols-outlined text-[18px] text-[#6324eb]">
                                                        {statusFilter === 'Tất cả' ? 'apps' :
                                                            statusFilter === 'Đang chờ' ? 'schedule' :
                                                                statusFilter === 'Đang tiến hành' ? 'sync' :
                                                                    statusFilter === 'Hoàn thành' ? 'check_circle' : 'block'}
                                                    </span>
                                                    <span className="text-xs">{statusFilter}</span>
                                                </div>
                                                <span className={`material-symbols-outlined text-slate-400 text-[16px] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                                            </button>

                                            {isDropdownOpen && (
                                                <div className="absolute top-[calc(100%+8px)] right-0 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="p-1.5">
                                                        {statusOptions.map(opt => (
                                                            <button
                                                                key={opt}
                                                                onClick={() => {
                                                                    setStatusFilter(opt);
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${statusFilter === opt ? 'bg-[#6D28D9] text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`size-7 rounded-lg flex items-center justify-center transition-colors ${statusFilter === opt ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700'}`}>
                                                                        <span className={`material-symbols-outlined text-[16px] ${statusFilter === opt ? 'text-white' : 'text-slate-400 group-hover:text-[#6D28D9]'}`}>
                                                                            {opt === 'Tất cả' ? 'apps' :
                                                                                opt === 'Đang chờ' ? 'schedule' :
                                                                                    opt === 'Đang tiến hành' ? 'sync' :
                                                                                        opt === 'Hoàn thành' ? 'check_circle' : 'block'}
                                                                        </span>
                                                                    </div>
                                                                    <span>{opt}</span>
                                                                </div>
                                                                {statusFilter === opt && (
                                                                    <span className="material-symbols-outlined text-sm">check</span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800">
                                            <tr>
                                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Người hiến</th>
                                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Nhóm máu</th>
                                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Thời gian</th>
                                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Lượng hiến</th>
                                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Tác vụ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {paginatedAppointments.length > 0 ? paginatedAppointments.map(a => (
                                                <tr key={a.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-black text-[#6D28D9] text-xs shadow-sm">{a.code}</div>
                                                            <div>
                                                                <div className="text-sm font-extrabold text-slate-900 dark:text-white">{a.name}</div>
                                                                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">{a.type}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-black border ${a.bloodClass.includes('emerald') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-500 border-indigo-100'}`}>
                                                            {a.blood}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                                                            <span className="material-symbols-outlined text-[18px] text-slate-300">schedule</span>
                                                            {a.time}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-1.5">
                                                            {(a.status === "Đang chờ" || a.status === "Đang tiến hành") && !isEnded ? (
                                                                <div className="flex gap-1.5">
                                                                    {[250, 350, 450].map(v => (
                                                                        <button
                                                                            key={v}
                                                                            onClick={() => handleDonatedChange(a.id, v)}
                                                                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${a.donated === v ? 'bg-[#6D28D9] text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700 hover:border-[#6D28D9]'}`}
                                                                        >
                                                                            {v}
                                                                        </button>
                                                                    ))}
                                                                    <span className="text-[9px] font-bold text-slate-400 self-center ml-1">ml</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-sm font-black text-[#6D28D9]">{a.donated || 0}</span>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">ml</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight ${a.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-600' :
                                                            a.status === 'Hoãn hiến' ? 'bg-indigo-50 text-indigo-600' :
                                                                a.status === 'Đang tiến hành' ? 'bg-amber-50 text-amber-600' :
                                                                    'bg-indigo-50 text-indigo-600'
                                                            }`}>
                                                            {a.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center justify-center gap-3">
                                                            {!isEnded && a.status !== "Hoàn thành" && a.status !== "Hoãn hiến" ? (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        className="px-5 h-10 bg-[#6D28D9] text-white rounded-full text-[11px] font-black uppercase tracking-wider hover:bg-[#5B21B6] hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                                                                        onClick={() => handleConfirm(a.id)}
                                                                    >
                                                                        Xác nhận hiến
                                                                    </button>
                                                                    <div className="relative group/menu">
                                                                        <button className="size-10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-300 hover:text-slate-600 transition-colors flex items-center justify-center">
                                                                            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                                                                        </button>
                                                                        <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-xl p-2 z-10 w-32 border border-slate-200">
                                                                            <button
                                                                                onClick={() => handleDefer(a.id)}
                                                                                className="w-full px-4 py-2 text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg text-left transition-colors flex items-center gap-2"
                                                                            >
                                                                                <span className="material-symbols-outlined text-sm">block</span> Hoãn hiến
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[11px] text-slate-300 font-bold uppercase italic">Kết thúc hồ sơ</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={6} className="px-8 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                                            <span className="material-symbols-outlined text-[64px]">event_busy</span>
                                                            <p className="font-extrabold uppercase tracking-widest text-sm">Không có lịch hẹn nào</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-10 py-8 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
                                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                        Hiển thị {sortedAppointments.length === 0 ? 0 : ((currentPage - 1) * pageSize + 1)}-{Math.min(currentPage * pageSize, sortedAppointments.length)} / {sortedAppointments.length} bản ghi
                                    </span>
                                    <div className="flex gap-3">
                                        <button
                                            className="size-10 flex items-center justify-center rounded-full border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-[#6D28D9] disabled:opacity-30 disabled:hover:text-slate-400 transition-all"
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                        </button>
                                        <button
                                            className="size-10 flex items-center justify-center rounded-full border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-[#6D28D9] disabled:opacity-30 disabled:hover:text-slate-400 transition-all"
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages || totalPages === 0}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
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
